import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PlatformRole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getOrCreate(projectId: string, userId: string, userRole: string) {
    await this.checkProjectAccess(projectId, userId, userRole);

    const existing = await this.prisma.report.findUnique({
      where: { projectId },
    });
    if (existing) return existing;

    return this.prisma.report.create({
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
    await this.checkProjectAccess(projectId, userId, userRole);

    return this.prisma.report.upsert({
      where: { projectId },
      update: { content: content ?? Prisma.JsonNull },
      create: {
        projectId,
        content: content ?? Prisma.JsonNull,
      },
    });
  }

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
}
