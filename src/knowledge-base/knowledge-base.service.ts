import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKbEntryDto } from './dto/create-kb-entry.dto';
import { UpdateKbEntryDto } from './dto/update-kb-entry.dto';
import * as fs from 'fs';

@Injectable()
export class KnowledgeBaseService {
  constructor(private prisma: PrismaService) {}

  async findAllEnterprise() {
    return this.prisma.knowledgeEntry.findMany({
      where: { scope: 'enterprise' },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createEnterprise(dto: CreateKbEntryDto) {
    return this.prisma.knowledgeEntry.create({
      data: {
        title: dto.title,
        content: dto.content || '',
        scope: 'enterprise',
        type: 'text',
      },
    });
  }

  async uploadEnterprise(file: Express.Multer.File) {
    const content = fs.readFileSync(file.path, 'utf-8');
    return this.prisma.knowledgeEntry.create({
      data: {
        title: file.originalname.replace(/\.[^.]+$/, ''),
        content,
        scope: 'enterprise',
        type: 'file',
        fileName: file.originalname,
      },
    });
  }

  async findAllMine(userId: string) {
    return this.prisma.knowledgeEntry.findMany({
      where: { scope: 'user', userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createMine(dto: CreateKbEntryDto, userId: string) {
    return this.prisma.knowledgeEntry.create({
      data: {
        title: dto.title,
        content: dto.content || '',
        scope: 'user',
        type: 'text',
        userId,
      },
    });
  }

  async uploadMine(file: Express.Multer.File, userId: string) {
    const content = fs.readFileSync(file.path, 'utf-8');
    return this.prisma.knowledgeEntry.create({
      data: {
        title: file.originalname.replace(/\.[^.]+$/, ''),
        content,
        scope: 'user',
        type: 'file',
        fileName: file.originalname,
        userId,
      },
    });
  }

  async update(id: string, dto: UpdateKbEntryDto, userId: string, userRole: string) {
    const entry = await this.prisma.knowledgeEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Entrée introuvable');

    if (entry.scope === 'enterprise' && userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }
    if (entry.scope === 'user' && entry.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres entrées');
    }

    return this.prisma.knowledgeEntry.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
      },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const entry = await this.prisma.knowledgeEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Entrée introuvable');

    if (entry.scope === 'enterprise' && userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }
    if (entry.scope === 'user' && entry.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres entrées');
    }

    return this.prisma.knowledgeEntry.delete({ where: { id } });
  }

  async getContext(userId: string, projectId?: string) {
    const sections: string[] = [];

    const enterpriseEntries = await this.prisma.knowledgeEntry.findMany({
      where: { scope: 'enterprise' },
      select: { title: true, content: true },
    });
    if (enterpriseEntries.length > 0) {
      sections.push('=== BASE DE CONNAISSANCES ENTREPRISE ===');
      for (const entry of enterpriseEntries) {
        sections.push(`### ${entry.title}\n${entry.content}`);
      }
    }

    const userEntries = await this.prisma.knowledgeEntry.findMany({
      where: { scope: 'user', userId },
      select: { title: true, content: true },
    });
    if (userEntries.length > 0) {
      sections.push('\n=== BASE DE CONNAISSANCES PERSONNELLE ===');
      for (const entry of userEntries) {
        sections.push(`### ${entry.title}\n${entry.content}`);
      }
    }

    if (projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { aiEnabled: true, aiScopeIds: true },
      });

      if (project?.aiEnabled) {
        const aiScopeIds = project.aiScopeIds as string[];
        const scopeFilter = aiScopeIds.length > 0
          ? { id: { in: aiScopeIds }, projectId }
          : { projectId };

        const notes = await this.prisma.note.findMany({
          where: { scope: { ...scopeFilter } },
          select: { title: true, content: true, scope: { select: { name: true } } },
        });

        if (notes.length > 0) {
          sections.push('\n=== NOTES DU PROJET ===');
          for (const note of notes) {
            sections.push(`### [${note.scope.name}] ${note.title}\n${note.content}`);
          }
        }
      }
    }

    return sections.join('\n\n');
  }
}
