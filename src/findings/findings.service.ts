import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PlatformRole, ProjectRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFindingDto } from './dto/create-finding.dto';
import { UpdateFindingDto } from './dto/update-finding.dto';
import { MailService } from '../mail/mail.service';
import { hasPermission, PermissionKey } from '../auth/permissions';

@Injectable()
export class FindingsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(
    projectId: string,
    dto: CreateFindingDto,
    userId: string,
    userRole: string,
  ) {
    await this.requirePermission(projectId, userId, userRole, 'findings.create');

    // Compute next slug like "PROJECT-001" — stable per project
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const count = await this.prisma.finding.count({ where: { projectId } });
    const slugBase = project.name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 16) || 'FIND';
    const slug = `${slugBase}-${String(count + 1).padStart(3, '0')}`;

    const finding = await this.prisma.finding.create({
      data: {
        title: dto.title,
        slug,
        severity: dto.severity,
        cvssScore: dto.cvssScore,
        cvssVector: dto.cvssVector,
        description: dto.description ?? '',
        proof: dto.proof,
        impact: dto.impact,
        remediation: dto.remediation,
        references: dto.references,
        tags: dto.tags,
        status: dto.status,
        projectId,
        authorId: userId,
        componentId: dto.componentId,
        noteId: dto.noteId,
      },
      include: this.includes(),
    });

    const members = await this.prisma.projectMember.findMany({
      where: { projectId, userId: { not: userId } },
      include: { user: { select: { email: true } } },
    });
    const creatorName = `${finding.author.firstName} ${finding.author.lastName}`;
    for (const member of members) {
      this.mailService.sendFindingCreated(
        member.user.email,
        project.name,
        finding.title,
        finding.severity,
        creatorName,
      );
    }

    return finding;
  }

  async findAllByProject(projectId: string, userId: string, userRole: string) {
    await this.checkProjectAccess(projectId, userId, userRole);
    return this.prisma.finding.findMany({
      where: { projectId },
      include: this.includes(),
      orderBy: [{ severity: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const finding = await this.prisma.finding.findUnique({
      where: { id },
      include: {
        ...this.includes(),
        project: {
          select: {
            id: true,
            name: true,
            members: { select: { userId: true } },
          },
        },
      },
    });
    if (!finding) throw new NotFoundException('Finding not found');
    if (userRole !== PlatformRole.SUPER_ADMIN) {
      const isMember = finding.project.members.some((m) => m.userId === userId);
      if (!isMember) throw new ForbiddenException('Access denied');
    }
    return finding;
  }

  async update(
    id: string,
    dto: UpdateFindingDto,
    userId: string,
    userRole: string,
  ) {
    const finding = await this.findOne(id, userId, userRole);
    const member = await this.requirePermission(
      finding.projectId,
      userId,
      userRole,
      'findings.edit',
    );
    this.assertCanTouchFinding(member, finding.authorId, userId);
    return this.prisma.finding.update({
      where: { id: finding.id },
      data: {
        title: dto.title,
        severity: dto.severity,
        cvssScore: dto.cvssScore,
        cvssVector: dto.cvssVector,
        description: dto.description,
        proof: dto.proof,
        impact: dto.impact,
        remediation: dto.remediation,
        references: dto.references,
        tags: dto.tags,
        status: dto.status,
        componentId: dto.componentId,
        noteId: dto.noteId,
      },
      include: this.includes(),
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const finding = await this.findOne(id, userId, userRole);
    const member = await this.requirePermission(
      finding.projectId,
      userId,
      userRole,
      'findings.delete',
    );
    this.assertCanTouchFinding(member, finding.authorId, userId);
    return this.prisma.finding.delete({ where: { id: finding.id } });
  }

  private includes() {
    return {
      author: { select: { id: true, firstName: true, lastName: true, email: true } },
      component: { select: { id: true, name: true, status: true } },
    } as const;
  }

  // Read access: any project member (incl. CLIENT) may consult findings.
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

  // Write access: enforces the project-level permission matrix. Returns the
  // member's project role (null for SUPER_ADMIN, who bypasses the matrix).
  private async requirePermission(
    projectId: string,
    userId: string,
    userRole: string,
    permission: PermissionKey,
  ): Promise<ProjectRole | null> {
    if (userRole === PlatformRole.SUPER_ADMIN) return null;
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
    if (!hasPermission(member.role, permission, overrides)) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission pour cette action",
      );
    }
    return member.role;
  }

  // Horizontal partitioning: a PENTESTER may only modify/delete findings they
  // authored. MANAGER (project lead) and SUPER_ADMIN are exempt.
  private assertCanTouchFinding(
    role: ProjectRole | null,
    authorId: string,
    userId: string,
  ) {
    if (role === ProjectRole.PENTESTER && authorId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres findings',
      );
    }
  }
}
