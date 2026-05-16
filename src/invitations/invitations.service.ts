import {
  Injectable,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PlatformRole, InvitationStatus, ProjectRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

  async invite(
    projectId: string,
    dto: CreateInvitationDto,
    invitedById: string,
    inviterRole: string,
  ) {
    await this.checkManagerAccess(projectId, invitedById, inviterRole);

    const existing = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: dto.userId, projectId } },
    });
    if (existing) {
      throw new ConflictException('Cet utilisateur est déjà membre du projet');
    }

    const existingInvite = await this.prisma.invitation.findUnique({
      where: { userId_projectId: { userId: dto.userId, projectId } },
    });
    if (existingInvite && existingInvite.status === InvitationStatus.PENDING) {
      throw new ConflictException('Une invitation est déjà en attente pour cet utilisateur');
    }

    if (existingInvite) {
      return this.prisma.invitation.update({
        where: { id: existingInvite.id },
        data: { status: InvitationStatus.PENDING, role: dto.role, invitedById },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          project: { select: { id: true, name: true } },
        },
      });
    }

    return this.prisma.invitation.create({
      data: {
        projectId,
        userId: dto.userId,
        role: dto.role,
        invitedById,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  async getProjectInvitations(projectId: string, userId: string, userRole: string) {
    await this.checkProjectAccess(projectId, userId, userRole);
    return this.prisma.invitation.findMany({
      where: { projectId, status: InvitationStatus.PENDING },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        invitedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyInvitations(userId: string) {
    return this.prisma.invitation.findMany({
      where: { userId, status: InvitationStatus.PENDING },
      include: {
        project: { select: { id: true, name: true, clientCompany: true } },
        invitedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async accept(invitationId: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });
    if (!invitation) throw new NotFoundException('Invitation introuvable');
    if (invitation.userId !== userId) throw new ForbiddenException('Accès refusé');
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ConflictException('Cette invitation a déjà été traitée');
    }

    await this.prisma.$transaction([
      this.prisma.invitation.update({
        where: { id: invitationId },
        data: { status: InvitationStatus.ACCEPTED },
      }),
      this.prisma.projectMember.create({
        data: {
          projectId: invitation.projectId,
          userId: invitation.userId,
          role: invitation.role,
        },
      }),
    ]);

    return { message: 'Invitation acceptée' };
  }

  async decline(invitationId: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });
    if (!invitation) throw new NotFoundException('Invitation introuvable');
    if (invitation.userId !== userId) throw new ForbiddenException('Accès refusé');
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ConflictException('Cette invitation a déjà été traitée');
    }

    await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.DECLINED },
    });

    return { message: 'Invitation refusée' };
  }

  async cancel(invitationId: string, userId: string, userRole: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });
    if (!invitation) throw new NotFoundException('Invitation introuvable');
    await this.checkManagerAccess(invitation.projectId, userId, userRole);

    await this.prisma.invitation.delete({ where: { id: invitationId } });
    return { message: 'Invitation annulée' };
  }

  private async checkManagerAccess(projectId: string, userId: string, userRole: string) {
    if (userRole === PlatformRole.SUPER_ADMIN) return;
    const member = await this.prisma.projectMember.findFirst({
      where: { projectId, userId, role: ProjectRole.MANAGER },
    });
    if (!member) throw new ForbiddenException('Accès refusé');
  }

  private async checkProjectAccess(projectId: string, userId: string, userRole: string) {
    if (userRole === PlatformRole.SUPER_ADMIN) return;
    const member = await this.prisma.projectMember.findFirst({
      where: { projectId, userId },
    });
    if (!member) throw new ForbiddenException('Accès refusé');
  }
}
