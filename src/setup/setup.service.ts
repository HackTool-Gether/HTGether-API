import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PlatformRole, AuthProviderType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { SetupDto } from './dto/setup.dto';
import { OnboardingDto } from './dto/onboarding.dto';

const SALT_ROUNDS = 12;

// Map onboarding provider types to OIDC configs
const SSO_PRESETS: Record<string, { name: string; issuerUrl?: string; scope: string; authorizationUrl?: string; tokenUrl?: string; userinfoUrl?: string }> = {
  GOOGLE: {
    name: 'Google',
    issuerUrl: 'https://accounts.google.com',
    scope: 'openid email profile',
  },
  GITHUB: {
    name: 'GitHub',
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userinfoUrl: 'https://api.github.com/user',
    scope: 'user:email read:user',
  },
  AZURE_AD: {
    name: 'Azure AD',
    issuerUrl: 'https://login.microsoftonline.com/common/v2.0',
    scope: 'openid email profile',
  },
};

@Injectable()
export class SetupService {
  private readonly logger = new Logger(SetupService.name);

  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  async isSetupComplete(): Promise<{ isSetup: boolean; onboardingComplete: boolean }> {
    const superAdmin = await this.prisma.user.findFirst({
      where: { role: PlatformRole.SUPER_ADMIN },
    });
    const onboardingComplete = await this.settingsService.isOnboardingComplete();
    return { isSetup: !!superAdmin, onboardingComplete };
  }

  async createSuperAdmin(dto: SetupDto) {
    const existing = await this.prisma.user.findFirst({
      where: { role: PlatformRole.SUPER_ADMIN },
    });

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    if (existing) {
      const user = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      });
      return { message: 'Setup complete', user };
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: PlatformRole.SUPER_ADMIN,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    await this.ensureLocalProvider();

    return { message: 'Setup complete', user };
  }

  private async ensureLocalProvider() {
    const existing = await this.prisma.authProvider.findFirst({
      where: { type: AuthProviderType.LOCAL },
    });
    if (!existing) {
      await this.prisma.authProvider.create({
        data: {
          type: AuthProviderType.LOCAL,
          name: 'Email & Password',
          isEnabled: true,
          displayOrder: 0,
          config: {},
        },
      });
    }
  }

  async completeOnboarding(dto: OnboardingDto) {
    const existing = await this.settingsService.isOnboardingComplete();
    if (existing) {
      throw new ForbiddenException('Onboarding has already been completed');
    }

    // 1. Create super admin
    let superAdmin = await this.prisma.user.findFirst({
      where: { role: PlatformRole.SUPER_ADMIN },
    });

    if (!superAdmin) {
      const hashedPassword = await bcrypt.hash(dto.admin.password, SALT_ROUNDS);
      superAdmin = await this.prisma.user.create({
        data: {
          email: dto.admin.email,
          password: hashedPassword,
          firstName: dto.admin.firstName,
          lastName: dto.admin.lastName,
          role: PlatformRole.SUPER_ADMIN,
        },
      });
      this.logger.log(`Super Admin created via onboarding: ${dto.admin.email}`);
    } else {
      // Update existing super admin with onboarding credentials
      const hashedPassword = await bcrypt.hash(dto.admin.password, SALT_ROUNDS);
      superAdmin = await this.prisma.user.update({
        where: { id: superAdmin.id },
        data: {
          email: dto.admin.email,
          password: hashedPassword,
          firstName: dto.admin.firstName,
          lastName: dto.admin.lastName,
        },
      });
      this.logger.log(`Super Admin updated via onboarding: ${dto.admin.email}`);
    }

    // 2. Save company settings
    await this.settingsService.set('company', dto.company);

    // 3. Configure auth providers
    // First, clear existing non-local providers
    await this.prisma.authProvider.deleteMany({
      where: { type: { not: AuthProviderType.LOCAL } },
    });

    for (const provider of dto.auth.providers) {
      if (provider.type === 'LOCAL') {
        await this.prisma.authProvider.upsert({
          where: { type_name: { type: AuthProviderType.LOCAL, name: 'Email & Password' } },
          update: { isEnabled: provider.enabled },
          create: {
            type: AuthProviderType.LOCAL,
            name: 'Email & Password',
            isEnabled: provider.enabled,
            displayOrder: 0,
            config: {},
          },
        });
      } else if (provider.type === 'CUSTOM_OIDC') {
        // Custom OIDC
        await this.prisma.authProvider.create({
          data: {
            type: AuthProviderType.OIDC,
            name: provider.config?.name || 'Custom OIDC',
            isEnabled: provider.enabled,
            config: provider.config || {},
            displayOrder: 10,
          },
        });
      } else if (SSO_PRESETS[provider.type]) {
        // Preset SSO (Google, GitHub, Azure AD)
        const preset = SSO_PRESETS[provider.type];
        const presetConfig: Record<string, any> = {
          scope: preset.scope,
          clientId: provider.config?.clientId || '',
          clientSecret: provider.config?.clientSecret || '',
        };
        if (preset.issuerUrl) presetConfig.issuerUrl = preset.issuerUrl;
        if (preset.authorizationUrl) presetConfig.authorizationUrl = preset.authorizationUrl;
        if (preset.tokenUrl) presetConfig.tokenUrl = preset.tokenUrl;
        if (preset.userinfoUrl) presetConfig.userinfoUrl = preset.userinfoUrl;
        await this.prisma.authProvider.create({
          data: {
            type: AuthProviderType.OIDC,
            name: preset.name,
            isEnabled: provider.enabled,
            config: presetConfig,
            displayOrder: 5,
          },
        });
      } else if (provider.type === 'LDAP') {
        await this.prisma.authProvider.create({
          data: {
            type: AuthProviderType.LDAP,
            name: provider.config?.name || 'LDAP',
            isEnabled: provider.enabled,
            config: provider.config || {},
            displayOrder: 8,
          },
        });
      }
    }

    // 4. Save AI settings
    await this.settingsService.set('ai', {
      enabled: dto.ai.enabled,
      provider: dto.ai.provider || null,
      apiKey: dto.ai.apiKey || null,
      model: dto.ai.model || null,
    });

    // 5. Save SMTP settings
    if (dto.smtp) {
      await this.settingsService.set('smtp', dto.smtp);
    }

    // 6. Mark onboarding as complete
    await this.settingsService.set('onboarding', { completed: true });

    this.logger.log('Onboarding completed successfully');

    return { message: 'Onboarding complete' };
  }
}
