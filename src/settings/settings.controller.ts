import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PlatformRole } from '@prisma/client';

@Controller('settings')
export class SettingsController {
  constructor(
    private settingsService: SettingsService,
    private prisma: PrismaService,
  ) {}

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

  // Public: check if self-registration is available
  @Get('allowed-domains/check')
  async checkSelfRegistration() {
    const count = await this.prisma.allowedDomain.count();
    return { selfRegistrationEnabled: count > 0 };
  }

  // Admin: list domains
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.SUPER_ADMIN)
  @Get('allowed-domains')
  async getAllowedDomains() {
    return this.prisma.allowedDomain.findMany({ orderBy: { createdAt: 'desc' } });
  }

  // Admin: add domain
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.SUPER_ADMIN)
  @Post('allowed-domains')
  async addAllowedDomain(@Body() dto: { pattern: string }, @CurrentUser('id') userId: string) {
    const pattern = (dto.pattern || '').trim().toLowerCase();

    if (!pattern) {
      throw new BadRequestException('Veuillez saisir un domaine.');
    }
    if (!/^(\*\.)?[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(pattern)) {
      throw new BadRequestException(
        'Format de domaine invalide. Indiquez un domaine exact (ex. acme.com) ou ' +
          'un joker de sous-domaines (ex. *.acme.com). Le joker « * » seul n\'est pas accepté.',
      );
    }

    try {
      return await this.prisma.allowedDomain.create({
        data: { pattern, createdById: userId },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new BadRequestException('Ce domaine est déjà dans la liste.');
      }
      throw err;
    }
  }

  // Admin: delete domain
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.SUPER_ADMIN)
  @Delete('allowed-domains/:id')
  async deleteAllowedDomain(@Param('id') id: string) {
    return this.prisma.allowedDomain.delete({ where: { id } });
  }
}
