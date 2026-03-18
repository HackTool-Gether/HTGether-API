import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(scopeId: string, dto: CreateNoteDto, userId: string, userRole: string) {
    await this.checkScopeAccess(scopeId, userId, userRole);
    return this.prisma.note.create({
      data: {
        title: dto.title,
        content: dto.content || '',
        scopeId,
        authorId: userId,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findAllByScope(scopeId: string, userId: string, userRole: string) {
    await this.checkScopeAccess(scopeId, userId, userRole);
    return this.prisma.note.findMany({
      where: { scopeId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        scope: {
          select: {
            id: true,
            name: true,
            project: {
              select: {
                id: true,
                name: true,
                members: { select: { userId: true } },
              },
            },
          },
        },
      },
    });

    if (!note) throw new NotFoundException('Note not found');

    if (userRole !== PlatformRole.SUPER_ADMIN) {
      const isMember = note.scope.project.members.some((m) => m.userId === userId);
      if (!isMember) throw new ForbiddenException('Access denied');
    }

    return note;
  }

  async update(id: string, dto: UpdateNoteDto, userId: string, userRole: string) {
    const note = await this.findOne(id, userId, userRole);
    return this.prisma.note.update({
      where: { id: note.id },
      data: dto,
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const note = await this.findOne(id, userId, userRole);
    return this.prisma.note.delete({ where: { id: note.id } });
  }

  private async checkScopeAccess(scopeId: string, userId: string, userRole: string) {
    if (userRole === PlatformRole.SUPER_ADMIN) return;
    const scope = await this.prisma.scope.findUnique({
      where: { id: scopeId },
      include: { project: { select: { members: { select: { userId: true } } } } },
    });
    if (!scope) throw new NotFoundException('Scope not found');
    const isMember = scope.project.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('Access denied');
  }
}
