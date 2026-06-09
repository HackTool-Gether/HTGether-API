import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PlatformRole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { hasPermission } from '../auth/permissions';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // ── Legacy endpoints (backward-compatible) ──────────────────────────

  async getOrCreate(projectId: string, userId: string, userRole: string) {
    await this.checkProjectAccess(projectId, userId, userRole);

    const existing = await (this.prisma.report as any).findFirst({
      where: { projectId },
    });
    if (existing) return existing;

    return (this.prisma.report as any).create({
      data: {
        projectId,
        content: Prisma.JsonNull as any,
      },
    });
  }

  async update(
    projectId: string,
    content: any,
    userId: string,
    userRole: string,
  ) {
    await this.requireReportEdit(projectId, userId, userRole);

    const existing = await (this.prisma.report as any).findFirst({
      where: { projectId },
    });

    if (existing) {
      return (this.prisma.report as any).update({
        where: { id: existing.id },
        data: { content: content ?? Prisma.JsonNull },
      });
    }

    return (this.prisma.report as any).create({
      data: {
        projectId,
        content: content ?? Prisma.JsonNull,
      },
    });
  }

  // ── New multi-report endpoints ──────────────────────────────────────

  async findAll(projectId: string, userId: string, userRole: string) {
    await this.checkProjectAccess(projectId, userId, userRole);

    return (this.prisma.report as any).findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(reportId: string, userId: string, userRole: string) {
    const report = await (this.prisma.report as any).findUnique({
      where: { id: reportId },
    });
    if (!report) throw new NotFoundException('Report not found');

    await this.checkProjectAccess(report.projectId, userId, userRole);
    return report;
  }

  async create(
    projectId: string,
    dto: CreateReportDto,
    userId: string,
    userRole: string,
  ) {
    await this.requireReportEdit(projectId, userId, userRole);

    return (this.prisma.report as any).create({
      data: {
        projectId,
        name: dto.name,
        content: dto.content ?? Prisma.JsonNull,
        templateId: dto.templateId ?? null,
      },
    });
  }

  async updateOne(
    reportId: string,
    dto: UpdateReportDto,
    userId: string,
    userRole: string,
  ) {
    const report = await (this.prisma.report as any).findUnique({
      where: { id: reportId },
    });
    if (!report) throw new NotFoundException('Report not found');

    await this.requireReportEdit(report.projectId, userId, userRole);

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.content !== undefined) data.content = dto.content ?? Prisma.JsonNull;
    if (dto.templateId !== undefined) data.templateId = dto.templateId ?? null;

    return (this.prisma.report as any).update({
      where: { id: reportId },
      data,
    });
  }

  async remove(reportId: string, userId: string, userRole: string) {
    const report = await (this.prisma.report as any).findUnique({
      where: { id: reportId },
    });
    if (!report) throw new NotFoundException('Report not found');

    await this.requireReportEdit(report.projectId, userId, userRole);

    return (this.prisma.report as any).delete({
      where: { id: reportId },
    });
  }

  // ── Access control ─────────────────────────────────────────────────

  // Read access: any project member (incl. CLIENT) may consult the report.
  private async checkProjectAccess(
    projectId: string,
    userId: string,
    userRole: string,
  ) {
    if (userRole === PlatformRole.SUPER_ADMIN) return;
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { select: { userId: true } } },
    });
    if (!project) throw new NotFoundException('Project not found');
    const isMember = project.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('Access denied');
  }

  // Write access: editing the report requires the `report.edit` permission.
  // CLIENT has no write rights, so they keep read-only access only.
  private async requireReportEdit(
    projectId: string,
    userId: string,
    userRole: string,
  ) {
    if (userRole === PlatformRole.SUPER_ADMIN) return;
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        rolePermissions: true,
        members: { where: { userId }, select: { role: true } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    const member = project.members[0];
    if (!member) throw new ForbiddenException('Access denied');
    const overrides = (project.rolePermissions ?? {}) as Record<
      string,
      Record<string, boolean>
    >;
    if (!hasPermission(member.role, 'report.edit', overrides)) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission de modifier le rapport",
      );
    }
  }
}
