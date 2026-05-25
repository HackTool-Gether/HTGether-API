import { Controller, Post, Body, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { OidcCallbackDto } from './dto/oidc-callback.dto';
import { LdapLoginDto } from './dto/ldap-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { SelfRegisterDto } from './dto/self-register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  async register(@Body() dto: SelfRegisterDto) {
    return this.authService.selfRegister(dto);
  }

  // OIDC: get redirect URL for SSO provider
  @Get('oidc/authorize')
  async oidcAuthorize(
    @Query('providerId') providerId: string,
    @Query('callbackUrl') callbackUrl: string,
  ) {
    return this.authService.getOidcAuthUrl(providerId, callbackUrl);
  }

  // OIDC: handle callback after SSO login
  @Post('oidc/callback')
  async oidcCallback(@Body() dto: OidcCallbackDto) {
    return this.authService.handleOidcCallback(dto.providerId, dto.currentUrl, dto.redirectUri);
  }

  // LDAP: login with LDAP credentials
  @Post('ldap/login')
  async ldapLogin(@Body() dto: LdapLoginDto) {
    return this.authService.ldapLogin(dto.email, dto.password, dto.providerId);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@CurrentUser('id') userId: string, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(userId, dto.currentPassword, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('onboarding')
  async updateOnboarding(@CurrentUser('id') userId: string, @Body() dto: UpdateOnboardingDto) {
    return this.authService.updateOnboarding(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('avatar')
  async updateAvatar(@CurrentUser('id') userId: string, @Body() dto: UpdateAvatarDto) {
    return this.authService.updateAvatar(userId, dto);
  }
}
