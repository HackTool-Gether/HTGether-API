import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PlatformRole, ProjectRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UpdateKanbanConfigDto } from './dto/update-kanban-config.dto';
import { CreateRemarkDto } from './dto/create-remark.dto';
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

  // ── Global dashboard stats ──

  async getDashboardStats(userId: string, userRole: string) {
    const where = userRole === PlatformRole.SUPER_ADMIN
      ? {}
      : { members: { some: { userId } } };

    const projects = await this.prisma.project.findMany({
      where,
      select: { id: true, status: true },
    });
    const projectIds = projects.map((p) => p.id);

    const [findings, tasks, recentFindings, recentTasks, users] = await Promise.all([
      this.prisma.finding.findMany({
        where: { projectId: { in: projectIds } },
        select: { severity: true, status: true },
      }),
      this.prisma.task.findMany({
        where: { projectId: { in: projectIds } },
        select: { status: true },
      }),
      this.prisma.finding.findMany({
        where: { projectId: { in: projectIds } },
        select: {
          id: true, title: true, severity: true, createdAt: true,
          project: { select: { id: true, name: true } },
          author: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.task.findMany({
        where: { projectId: { in: projectIds }, status: 'DONE' },
        select: {
          id: true, title: true, updatedAt: true,
          project: { select: { id: true, name: true } },
          assignee: { select: { user: { select: { id: true, firstName: true, lastName: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      this.prisma.user.count({ where: { isActive: true } }),
    ]);

    const activeProjects = projects.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'IN_REVIEW');

    const bySeverity: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
    const openFindings = findings.filter((f) => f.status !== 'FIXED' && f.status !== 'FALSE_POSITIVE');
    for (const f of openFindings) {
      bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
    }

    const tasksDone = tasks.filter((t) => t.status === 'DONE').length;
    const tasksInProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;

    return {
      projects: { total: projects.length, active: activeProjects.length },
      findings: { open: openFindings.length, bySeverity },
      tasks: { total: tasks.length, done: tasksDone, inProgress: tasksInProgress },
      users: { active: users },
      recentFindings: recentFindings.map((f) => ({
        id: f.id,
        title: f.title,
        severity: f.severity,
        projectName: f.project.name,
        projectId: f.project.id,
        authorName: `${f.author.firstName} ${f.author.lastName}`,
        createdAt: f.createdAt,
      })),
      recentTasks: recentTasks.map((t) => ({
        id: t.id,
        title: t.title,
        projectName: t.project.name,
        projectId: t.project.id,
        assigneeName: t.assignee ? `${t.assignee.user.firstName} ${t.assignee.user.lastName}` : null,
        completedAt: t.updatedAt,
      })),
    };
  }

  // ── Workload matrix ──

  async getWorkload(projectId: string, userId: string, userRole: string) {
    await this.checkProjectAccess(projectId, userId, userRole);

    const [members, scopes, tasks, assignments] = await Promise.all([
      this.prisma.projectMember.findMany({
        where: { projectId },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
      }),
      this.prisma.scope.findMany({
        where: { projectId },
        select: { id: true, name: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.task.findMany({
        where: { projectId },
        select: { id: true, status: true, assigneeId: true },
      }),
      this.prisma.scopeAssignment.findMany({
        where: { scope: { projectId } },
        select: { scopeId: true, memberId: true },
      }),
    ]);

    const assignmentSet = new Set(assignments.map((a) => `${a.scopeId}:${a.memberId}`));

    const memberStats = members.map((m) => {
      const memberTasks = tasks.filter((t) => t.assigneeId === m.id);
      return {
        memberId: m.id,
        userId: m.user.id,
        name: `${m.user.firstName} ${m.user.lastName}`,
        role: m.role,
        tasks: {
          total: memberTasks.length,
          done: memberTasks.filter((t) => t.status === 'DONE').length,
          inProgress: memberTasks.filter((t) => t.status === 'IN_PROGRESS').length,
          todo: memberTasks.filter((t) => t.status === 'TODO').length,
          backlog: memberTasks.filter((t) => t.status === 'BACKLOG').length,
        },
      };
    });

    const scopeRows = scopes.map((s) => {
      const assignedMembers = members
        .filter((m) => assignmentSet.has(`${s.id}:${m.id}`))
        .map((m) => m.id);
      return {
        scopeId: s.id,
        name: s.name,
        status: s.status,
        assignedMembers,
        unassigned: assignedMembers.length === 0,
      };
    });

    return { members: memberStats, scopes: scopeRows };
  }

  async assignScope(projectId: string, scopeId: string, memberId: string, userId: string, userRole: string) {
    await this.checkManagerAccess(projectId, userId, userRole);
    return this.prisma.scopeAssignment.create({
      data: { scopeId, memberId },
    });
  }

  async unassignScope(projectId: string, scopeId: string, memberId: string, userId: string, userRole: string) {
    await this.checkManagerAccess(projectId, userId, userRole);
    return this.prisma.scopeAssignment.delete({
      where: { scopeId_memberId: { scopeId, memberId } },
    });
  }

  // ── Remarks (manager-only) ──

  async getRemarks(projectId: string, userId: string, userRole: string) {
    await this.checkManagerAccess(projectId, userId, userRole);
    return this.prisma.projectRemark.findMany({
      where: { projectId },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRemark(projectId: string, dto: CreateRemarkDto, userId: string, userRole: string) {
    await this.checkManagerAccess(projectId, userId, userRole);
    return this.prisma.projectRemark.create({
      data: { content: dto.content, projectId, authorId: userId },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async removeRemark(projectId: string, remarkId: string, userId: string, userRole: string) {
    await this.checkManagerAccess(projectId, userId, userRole);
    return this.prisma.projectRemark.delete({ where: { id: remarkId } });
  }

  // ── Project stats ──

  async getStats(projectId: string, userId: string, userRole: string) {
    await this.checkProjectAccess(projectId, userId, userRole);

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { startDate: true, endDate: true, status: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const [scopes, findings, tasks, members] = await Promise.all([
      this.prisma.scope.findMany({ where: { projectId }, select: { id: true, status: true, updatedAt: true } }),
      this.prisma.finding.findMany({ where: { projectId }, select: { severity: true, status: true, authorId: true } }),
      this.prisma.task.findMany({
        where: { projectId },
        select: { status: true, assigneeId: true },
      }),
      this.prisma.projectMember.findMany({
        where: { projectId },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
      }),
    ]);

    const scopeStats = {
      total: scopes.length,
      completed: scopes.filter((s) => s.status === 'COMPLETED').length,
      inProgress: scopes.filter((s) => s.status === 'IN_PROGRESS').length,
      notStarted: scopes.filter((s) => s.status === 'NOT_STARTED').length,
      inReview: scopes.filter((s) => s.status === 'IN_REVIEW').length,
      completionPercent: scopes.length ? Math.round((scopes.filter((s) => s.status === 'COMPLETED').length / scopes.length) * 100) : 0,
    };

    const bySeverity: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
    const byFindingStatus: Record<string, number> = { DRAFT: 0, CONFIRMED: 0, FALSE_POSITIVE: 0, FIXED: 0 };
    const authorCounts: Record<string, number> = {};
    for (const f of findings) {
      bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
      byFindingStatus[f.status] = (byFindingStatus[f.status] || 0) + 1;
      authorCounts[f.authorId] = (authorCounts[f.authorId] || 0) + 1;
    }
    const memberMap = new Map(members.map((m) => [m.user.id, `${m.user.firstName} ${m.user.lastName}`]));
    const byAuthor = Object.entries(authorCounts).map(([userId, count]) => ({
      userId,
      name: memberMap.get(userId) || 'Inconnu',
      count,
    }));

    const byTaskStatus: Record<string, number> = { BACKLOG: 0, TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    const tasksByMember: Record<string, { total: number; done: number }> = {};
    for (const t of tasks) {
      byTaskStatus[t.status] = (byTaskStatus[t.status] || 0) + 1;
      if (t.assigneeId) {
        if (!tasksByMember[t.assigneeId]) tasksByMember[t.assigneeId] = { total: 0, done: 0 };
        tasksByMember[t.assigneeId].total++;
        if (t.status === 'DONE') tasksByMember[t.assigneeId].done++;
      }
    }
    const memberIdMap = new Map(members.map((m) => [m.id, `${m.user.firstName} ${m.user.lastName}`]));
    const byMember = Object.entries(tasksByMember).map(([memberId, v]) => ({
      memberId,
      name: memberIdMap.get(memberId) || 'Inconnu',
      total: v.total,
      done: v.done,
    }));

    const now = Date.now();
    const startMs = new Date(project.startDate).getTime();
    const endMs = new Date(project.endDate).getTime();
    const daysTotal = Math.max(1, Math.round((endMs - startMs) / 86400000));
    const daysElapsed = Math.max(0, Math.round((now - startMs) / 86400000));
    const progressPercent = Math.max(0, Math.min(100, Math.round((daysElapsed / daysTotal) * 100)));
    const isLate = now > endMs && project.status !== 'DELIVERED' && project.status !== 'ARCHIVED';

    const stalledDays = 7;
    const stalledThreshold = new Date(now - stalledDays * 86400000);
    const stalledScopes = scopes
      .filter((s) => s.status === 'IN_PROGRESS' && s.updatedAt < stalledThreshold)
      .map((s) => s.id);

    const unconfirmedFindings = findings.filter((f) => f.status === 'DRAFT').length;

    return {
      scopes: scopeStats,
      findings: { total: findings.length, bySeverity, byStatus: byFindingStatus, byAuthor },
      tasks: {
        total: tasks.length,
        byStatus: byTaskStatus,
        byMember,
        completionPercent: tasks.length ? Math.round((byTaskStatus.DONE / tasks.length) * 100) : 0,
      },
      timeline: {
        startDate: project.startDate,
        endDate: project.endDate,
        daysTotal,
        daysElapsed: Math.min(daysElapsed, daysTotal),
        progressPercent,
        isLate,
      },
      alerts: { isLate, stalledScopes, unconfirmedFindings },
    };
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
