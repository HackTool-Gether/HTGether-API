import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthProvidersService } from './auth-providers.service';
import { CreateAuthProviderDto } from './dto/create-auth-provider.dto';
import { UpdateAuthProviderDto } from './dto/update-auth-provider.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PlatformRole } from '@prisma/client';

@Controller('auth-providers')
export class AuthProvidersController {
  constructor(private authProvidersService: AuthProvidersService) {}

  // Public: login page needs to know which providers are available
  @Get('enabled')
  async getEnabled() {
    return this.authProvidersService.findEnabled();
  }

  // Admin only below
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.SUPER_ADMIN)
  @Get()
  async findAll() {
    return this.authProvidersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.SUPER_ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.authProvidersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.SUPER_ADMIN)
  @Post()
  async create(@Body() dto: CreateAuthProviderDto) {
    return this.authProvidersService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.SUPER_ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAuthProviderDto) {
    return this.authProvidersService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.authProvidersService.remove(id);
  }
}
