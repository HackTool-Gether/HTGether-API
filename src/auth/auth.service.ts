import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthProviderType, PlatformRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthProvidersService } from '../auth-providers/auth-providers.service';
import { LoginDto } from './dto/login.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private authProvidersService: AuthProvidersService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Allow SUPER_ADMIN to always login with credentials, even if local auth is disabled
    if (user.role !== PlatformRole.SUPER_ADMIN) {
      const localProvider = await this.authProvidersService.getProviderConfig(AuthProviderType.LOCAL);
      if (!localProvider) {
        throw new ForbiddenException('Local authentication is disabled');
      }
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  // OIDC: get the authorization URL to redirect the user to
  async getOidcAuthUrl(providerId: string, callbackUrl: string) {
    const provider = await this.authProvidersService.findOne(providerId);
    if (!provider.isEnabled || provider.type !== AuthProviderType.OIDC) {
      throw new BadRequestException('OIDC provider not available');
    }

    const config = provider.config as any;
    const oidc = await import('openid-client');
    const oidcConfig = await oidc.discovery(
      new URL(config.issuerUrl),
      config.clientId,
      config.clientSecret,
    );

    const authUrl = oidc.buildAuthorizationUrl(oidcConfig, {
      redirect_uri: callbackUrl,
      scope: config.scope || 'openid email profile',
    });

    return { authUrl: authUrl.href, providerId };
  }

  // OIDC: handle the callback after SSO login
  async handleOidcCallback(providerId: string, currentUrl: string, redirectUri: string) {
    const provider = await this.authProvidersService.findOne(providerId);
    if (!provider.isEnabled || provider.type !== AuthProviderType.OIDC) {
      throw new BadRequestException('OIDC provider not available');
    }

    const config = provider.config as any;
    const oidc = await import('openid-client');
    const oidcConfig = await oidc.discovery(
      new URL(config.issuerUrl),
      config.clientId,
      config.clientSecret,
    );

    try {
      const tokens = await oidc.authorizationCodeGrant(
        oidcConfig,
        new URL(currentUrl),
        { idTokenExpected: true },
      );

      const claims = tokens.claims();
      if (!claims) {
        throw new UnauthorizedException('Failed to get user info from OIDC provider');
      }

      const email = claims.email as string;
      const firstName = (claims.given_name || claims.name || 'User') as string;
      const lastName = (claims.family_name || '') as string;
      const externalId = claims.sub as string;

      if (!email) {
        throw new UnauthorizedException('OIDC provider did not return an email');
      }

      const user = await this.findOrCreateExternalUser(
        email,
        firstName,
        lastName,
        AuthProviderType.OIDC,
        externalId,
      );

      return this.buildAuthResponse(user);
    } catch (err) {
      this.logger.error(`OIDC callback error: ${err.message}`, err.stack);
      throw new UnauthorizedException(`SSO authentication failed: ${err.message}`);
    }
  }

  // LDAP: authenticate against LDAP directory
  async ldapLogin(email: string, password: string, providerId?: string) {
    const provider = providerId
      ? await this.authProvidersService.findOne(providerId)
      : await this.authProvidersService.getProviderConfig(AuthProviderType.LDAP);

    if (!provider || !provider.isEnabled) {
      throw new BadRequestException('LDAP authentication is not available');
    }

    const config = provider.config as any;
    const ldapUser = await this.ldapBind(config, email, password);

    const user = await this.findOrCreateExternalUser(
      ldapUser.email,
      ldapUser.firstName,
      ldapUser.lastName,
      AuthProviderType.LDAP,
      ldapUser.dn,
    );

    return this.buildAuthResponse(user);
  }

  private async ldapBind(
    config: { url: string; baseDn: string; userSearchFilter?: string; bindDn?: string; bindPassword?: string },
    email: string,
    password: string,
  ): Promise<{ email: string; firstName: string; lastName: string; dn: string }> {
    const ldap = await import('ldapjs');
    const client = ldap.createClient({ url: config.url });

    return new Promise((resolve, reject) => {
      const searchFilter = (config.userSearchFilter || '(mail={{email}})').replace('{{email}}', email);

      // If we have a service account, use it to search first
      const doBind = config.bindDn
        ? (cb: () => void) => client.bind(config.bindDn!, config.bindPassword!, (err) => err ? reject(new UnauthorizedException('LDAP service bind failed')) : cb())
        : (cb: () => void) => cb();

      doBind(() => {
        client.search(config.baseDn, { filter: searchFilter, scope: 'sub' }, (err, res) => {
          if (err) {
            client.unbind();
            return reject(new UnauthorizedException('LDAP search failed'));
          }

          let found = false;
          let userEntry: any = null;

          res.on('searchEntry', (entry) => {
            found = true;
            userEntry = entry;
          });

          res.on('end', () => {
            if (!found || !userEntry) {
              client.unbind();
              return reject(new UnauthorizedException('Invalid credentials'));
            }

            const dn = userEntry.dn.toString();
            // Bind as the user to verify password
            client.bind(dn, password, (bindErr) => {
              client.unbind();
              if (bindErr) {
                return reject(new UnauthorizedException('Invalid credentials'));
              }

              const attrs = userEntry.ppiAttributes || userEntry.attributes || [];
              const getAttribute = (name: string) => {
                const attr = attrs.find?.((a: any) => a.type === name);
                return attr?.values?.[0] || attr?.vals?.[0] || '';
              };

              resolve({
                email: getAttribute('mail') || email,
                firstName: getAttribute('givenName') || getAttribute('cn') || 'User',
                lastName: getAttribute('sn') || '',
                dn,
              });
            });
          });

          res.on('error', () => {
            client.unbind();
            reject(new UnauthorizedException('LDAP search error'));
          });
        });
      });
    });
  }

  private async findOrCreateExternalUser(
    email: string,
    firstName: string,
    lastName: string,
    authProvider: AuthProviderType,
    externalId: string,
  ) {
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new ForbiddenException('Aucun compte associé à cet email. Contactez votre administrateur.');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    // SSO login: update external ID + clear mustChangePassword
    const needsUpdate = !user.externalId || user.mustChangePassword;
    if (needsUpdate) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { externalId, authProvider, mustChangePassword: false },
      });
    }

    return user;
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.buildAuthResponse(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        onboardingCompleted: true,
        onboardingStep: true,
        authProvider: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async updateOnboarding(userId: string, dto: UpdateOnboardingDto) {
    const data: any = {};
    if (dto.step !== undefined) {
      data.onboardingStep = dto.step;
    }
    if (dto.completed !== undefined) {
      data.onboardingCompleted = dto.completed;
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        onboardingCompleted: true,
        onboardingStep: true,
      },
    });

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    // Check new password is different from current
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      throw new BadRequestException('Le nouveau mot de passe doit être différent de l\'ancien');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, mustChangePassword: false },
    });

    return this.buildAuthResponse(updated);
  }

  private async buildAuthResponse(user: any) {
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        mustChangePassword: user.mustChangePassword || false,
        onboardingCompleted: user.onboardingCompleted ?? false,
        onboardingStep: user.onboardingStep ?? 0,
      },
      ...tokens,
    };
  }

  private async generateTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: payload.sub, email: payload.email, role: payload.role },
        {
          secret: this.configService.get<string>('JWT_SECRET')!,
          expiresIn: '15m' as const,
        },
      ),
      this.jwtService.signAsync(
        { sub: payload.sub, email: payload.email, role: payload.role },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
          expiresIn: '7d' as const,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
