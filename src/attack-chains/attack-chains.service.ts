import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttackChainDto } from './dto/create-attack-chain.dto';
import { UpdateAttackChainDto } from './dto/update-attack-chain.dto';

@Injectable()
export class AttackChainsService {
  constructor(private prisma: PrismaService) {}

  async findAllByProject(projectId: string, userId: string, userRole: string) {
    await this.checkAccess(projectId, userId, userRole);
    return this.prisma.attackChain.findMany({
      where: { projectId },
      include: {
        findings: {
          include: {
            finding: {
              select: { id: true, title: true, severity: true, slug: true, status: true },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const chain = await this.prisma.attackChain.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, members: { select: { userId: true } } } },
        findings: {
          include: {
            finding: {
              select: { id: true, title: true, severity: true, slug: true, status: true, description: true },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!chain) throw new NotFoundException('Attack chain not found');
    if (userRole !== PlatformRole.SUPER_ADMIN) {
      if (!chain.project.members.some((m) => m.userId === userId)) {
        throw new ForbiddenException('Access denied');
      }
    }
    return chain;
  }

  async create(projectId: string, dto: CreateAttackChainDto, userId: string, userRole: string) {
    await this.checkAccess(projectId, userId, userRole);
    return this.prisma.attackChain.create({
      data: { name: dto.name, description: dto.description, projectId },
      include: { findings: true },
    });
  }

  async update(id: string, dto: UpdateAttackChainDto, userId: string, userRole: string) {
    const chain = await this.findOne(id, userId, userRole);
    return this.prisma.attackChain.update({
      where: { id: chain.id },
      data: { name: dto.name, description: dto.description },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const chain = await this.findOne(id, userId, userRole);
    return this.prisma.attackChain.delete({ where: { id: chain.id } });
  }

  async setFindings(id: string, findingIds: string[], userId: string, userRole: string) {
    const chain = await this.findOne(id, userId, userRole);

    await this.prisma.$transaction(async (tx) => {
      await tx.attackChainFinding.deleteMany({ where: { attackChainId: chain.id } });
      if (findingIds.length > 0) {
        await tx.attackChainFinding.createMany({
          data: findingIds.map((findingId, i) => ({
            attackChainId: chain.id,
            findingId,
            order: i,
          })),
        });
      }
    });

    return this.findOne(id, userId, userRole);
  }

  private async checkAccess(projectId: string, userId: string, userRole: string) {
    if (userRole === PlatformRole.SUPER_ADMIN) return;
    const member = await this.prisma.projectMember.findFirst({
      where: { projectId, userId },
    });
    if (!member) throw new ForbiddenException('Access denied');
  }
}
