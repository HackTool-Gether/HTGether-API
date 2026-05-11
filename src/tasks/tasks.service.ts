import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(
    projectId: string,
    dto: CreateTaskDto,
    userId: string,
    userRole: string,
  ) {
    await this.checkProjectAccess(projectId, userId, userRole);

    const maxPos = await this.prisma.task.aggregate({
      where: { projectId, status: 'BACKLOG' },
      _max: { position: true },
    });

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        position: (maxPos._max.position ?? -1) + 1,
        projectId,
        creatorId: userId,
      },
      include: this.includes(),
    });
  }

  async findAllByProject(
    projectId: string,
    userId: string,
    userRole: string,
  ) {
    await this.checkProjectAccess(projectId, userId, userRole);
    return this.prisma.task.findMany({
      where: { projectId },
      include: this.includes(),
      orderBy: [{ status: 'asc' }, { position: 'asc' }],
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const task = await this.prisma.task.findUnique({
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
    if (!task) throw new NotFoundException('Task not found');
    if (userRole !== PlatformRole.SUPER_ADMIN) {
      const isMember = task.project.members.some((m) => m.userId === userId);
      if (!isMember) throw new ForbiddenException('Access denied');
    }
    return task;
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    userId: string,
    userRole: string,
  ) {
    const task = await this.findOne(id, userId, userRole);
    return this.prisma.task.update({
      where: { id: task.id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate !== undefined
          ? (dto.dueDate ? new Date(dto.dueDate) : null)
          : undefined,
      },
      include: this.includes(),
    });
  }

  async move(
    id: string,
    dto: MoveTaskDto,
    userId: string,
    userRole: string,
  ) {
    const task = await this.findOne(id, userId, userRole);
    const projectId = task.projectId;

    return this.prisma.$transaction(async (tx) => {
      // Shift tasks in the target column to make room
      await tx.task.updateMany({
        where: {
          projectId,
          status: dto.status,
          position: { gte: dto.position },
          id: { not: id },
        },
        data: { position: { increment: 1 } },
      });

      return tx.task.update({
        where: { id },
        data: { status: dto.status, position: dto.position },
        include: this.includes(),
      });
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const task = await this.findOne(id, userId, userRole);
    return this.prisma.task.delete({ where: { id: task.id } });
  }

  private includes() {
    return {
      creator: {
        select: { id: true, firstName: true, lastName: true },
      },
      assignee: {
        select: {
          id: true,
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    } as const;
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
