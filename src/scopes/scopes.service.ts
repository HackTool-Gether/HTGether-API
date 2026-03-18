import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScopeDto } from './dto/create-scope.dto';
import { UpdateScopeDto } from './dto/update-scope.dto';

@Injectable()
export class ScopesService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, dto: CreateScopeDto, userId: string, userRole: string) {
    await this.checkProjectAccess(projectId, userId, userRole);
    return this.prisma.scope.create({
      data: { ...dto, projectId },
      include: { _count: { select: { notes: true, components: true } } },
    });
  }

  async findAllByProject(projectId: string, userId: string, userRole: string) {
    await this.checkProjectAccess(projectId, userId, userRole);
    return this.prisma.scope.findMany({
      where: { projectId },
      include: { _count: { select: { notes: true, components: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const scope = await this.prisma.scope.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, members: { select: { userId: true } } } },
        notes: {
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { updatedAt: 'desc' },
        },
        _count: { select: { notes: true, components: true } },
      },
    });
    if (!scope) throw new NotFoundException('Scope not found');
    if (userRole !== PlatformRole.SUPER_ADMIN) {
      const isMember = scope.project.members.some((m) => m.userId === userId);
      if (!isMember) throw new ForbiddenException('Access denied');
    }
    return scope;
  }

  async update(id: string, dto: UpdateScopeDto, userId: string, userRole: string) {
    const scope = await this.findOne(id, userId, userRole);
    return this.prisma.scope.update({
      where: { id: scope.id },
      data: dto,
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const scope = await this.findOne(id, userId, userRole);
    return this.prisma.scope.delete({ where: { id: scope.id } });
  }

  private async checkProjectAccess(projectId: string, userId: string, userRole: string) {
    if (userRole === PlatformRole.SUPER_ADMIN) return;
    const member = await this.prisma.projectMember.findFirst({
      where: { projectId, userId },
    });
    if (!member) throw new ForbiddenException('Access denied');
  }
}
