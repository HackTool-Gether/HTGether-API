import { Injectable, OnModuleInit, Logger, NotFoundException } from '@nestjs/common';
import { AuthProviderType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthProviderDto } from './dto/create-auth-provider.dto';
import { UpdateAuthProviderDto } from './dto/update-auth-provider.dto';

@Injectable()
export class AuthProvidersService implements OnModuleInit {
  private readonly logger = new Logger(AuthProvidersService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultLocalProvider();
  }

  private async seedDefaultLocalProvider() {
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
      this.logger.log('Default LOCAL auth provider created');
    }
  }

  async findAll() {
    return this.prisma.authProvider.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findEnabled() {
    const providers = await this.prisma.authProvider.findMany({
      where: { isEnabled: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        type: true,
        name: true,
        displayOrder: true,
      },
    });
    return providers;
  }

  async findOne(id: string) {
    const provider = await this.prisma.authProvider.findUnique({ where: { id } });
    if (!provider) throw new NotFoundException('Auth provider not found');
    return provider;
  }

  async create(dto: CreateAuthProviderDto) {
    return this.prisma.authProvider.create({ data: dto });
  }

  async update(id: string, dto: UpdateAuthProviderDto) {
    await this.findOne(id);
    return this.prisma.authProvider.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const provider = await this.findOne(id);
    if (provider.type === AuthProviderType.LOCAL) {
      throw new Error('Cannot delete the LOCAL auth provider');
    }
    return this.prisma.authProvider.delete({ where: { id } });
  }

  async getProviderConfig(type: AuthProviderType, name?: string) {
    const where: any = { type, isEnabled: true };
    if (name) where.name = name;
    return this.prisma.authProvider.findFirst({ where });
  }
}
