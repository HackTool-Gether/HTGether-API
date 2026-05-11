import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PlatformRole, ProjectRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UpdateKanbanConfigDto } from './dto/update-kanban-config.dto';
import { DEFAULT_PERMISSIONS, PERMISSION_KEYS } from '../auth/permissions';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string) {
    const project = await this.prisma.project.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        members: {
          create: {
            userId,
            role: ProjectRole.MANAGER,
          },
        },
      },
      include: { members: { include: { user: true } } },
    });
    return project;
  }

  async findAll(userId: string, userRole: string) {
    // SUPER_ADMIN sees all, users see only their projects
    const where = userRole === PlatformRole.SUPER_ADMIN
      ? {}
      : { members: { some: { userId } } };

    return this.prisma.project.findMany({
      where,
      include: {
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
        _count: { select: { scopes: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } } },
        scopes: {
          include: {
            _count: { select: { notes: true, components: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    // Check access
    if (userRole !== PlatformRole.SUPER_ADMIN) {
      const isMember = project.members.some((m) => m.userId === userId);
      if (!isMember) throw new ForbiddenException('Access denied');
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto, userId: string, userRole: string) {
    await this.checkManagerAccess(id, userId, userRole);
    return this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    await this.checkManagerAccess(id, userId, userRole);
    return this.prisma.project.delete({ where: { id } });
  }

  async addMember(projectId: string, dto: AddMemberDto, userId: string, userRole: string) {
    await this.checkManagerAccess(projectId, userId, userRole);
    return this.prisma.projectMember.create({
      data: { projectId, userId: dto.userId, role: dto.role },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  async removeMember(projectId: string, memberId: string, userId: string, userRole: string) {
    await this.checkManagerAccess(projectId, userId, userRole);
    return this.prisma.projectMember.delete({ where: { id: memberId } });
  }

  async updateMemberRole(projectId: string, memberId: string, dto: UpdateMemberRoleDto, userId: string, userRole: string) {
    await this.checkManagerAccess(projectId, userId, userRole);
    return this.prisma.projectMember.update({
      where: { id: memberId },
      data: { role: dto.role },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  async getPermissions(projectId: string, userId: string, userRole: string) {
    const project = await this.findOne(projectId, userId, userRole);
    const overrides = (project.rolePermissions ?? {}) as Record<string, Record<string, boolean>>;
    return {
      keys: PERMISSION_KEYS,
      defaults: DEFAULT_PERMISSIONS,
      overrides,
    };
  }

  async updatePermissions(projectId: string, dto: UpdatePermissionsDto, userId: string, userRole: string) {
    await this.checkManagerAccess(projectId, userId, userRole);
    return this.prisma.project.update({
      where: { id: projectId },
      data: { rolePermissions: dto.overrides },
      select: { id: true, rolePermissions: true },
    });
  }

  async updateKanbanConfig(projectId: string, dto: UpdateKanbanConfigDto, userId: string, userRole: string) {
    await this.checkProjectAccess(projectId, userId, userRole);
    return this.prisma.project.update({
      where: { id: projectId },
      data: { kanbanConfig: { labels: dto.labels } },
      select: { id: true, kanbanConfig: true },
    });
  }

  private async checkProjectAccess(projectId: string, userId: string, userRole: string) {
    if (userRole === PlatformRole.SUPER_ADMIN) return;
    const member = await this.prisma.projectMember.findFirst({
      where: { projectId, userId },
    });
    if (!member) throw new ForbiddenException('Access denied');
  }

  private async checkManagerAccess(projectId: string, userId: string, userRole: string) {
    if (userRole === PlatformRole.SUPER_ADMIN) return;
    const member = await this.prisma.projectMember.findFirst({
      where: { projectId, userId, role: ProjectRole.MANAGER },
    });
    if (!member) throw new ForbiddenException('Manager access required');
  }
}
