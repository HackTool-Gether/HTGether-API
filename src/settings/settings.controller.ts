import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PlatformRole } from '@prisma/client';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  // Public: check if onboarding is done
  @Get('onboarding/status')
  async getOnboardingStatus() {
    const completed = await this.settingsService.isOnboardingComplete();
    return { completed };
  }

  // Public: get company info (for branding on login page etc.)
  @Get('company')
  async getCompany() {
    return this.settingsService.get('company') || {};
  }

  // Admin only: get all settings
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.SUPER_ADMIN)
  @Get()
  async getAll() {
    return this.settingsService.getAll();
  }

  // Admin only: update a setting
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.SUPER_ADMIN)
  @Put(':key')
  async update(@Param('key') key: string, @Body() body: { value: any }) {
    return this.settingsService.set(key as any, body.value);
  }
}
