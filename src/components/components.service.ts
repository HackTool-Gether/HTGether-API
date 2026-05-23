import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';

@Injectable()
export class ComponentsService {
  constructor(private prisma: PrismaService) {}

  async findAllByScope(scopeId: string) {
    return this.prisma.component.findMany({
      where: { scopeId },
      include: { _count: { select: { findings: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const component = await this.prisma.component.findUnique({
      where: { id },
      include: { _count: { select: { findings: true } } },
    });
    if (!component) throw new NotFoundException('Component not found');
    return component;
  }

  async create(scopeId: string, dto: CreateComponentDto) {
    return this.prisma.component.create({
      data: {
        name: dto.name,
        type: dto.type,
        description: dto.description,
        status: dto.status as any,
        scopeId,
      },
      include: { _count: { select: { findings: true } } },
    });
  }

  async update(id: string, dto: UpdateComponentDto) {
    await this.findOne(id);
    return this.prisma.component.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type,
        description: dto.description,
        status: dto.status as any,
      },
      include: { _count: { select: { findings: true } } },
    });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    return this.prisma.component.update({
      where: { id },
      data: { status: status as any },
      include: { _count: { select: { findings: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.component.delete({ where: { id } });
  }

  async getStatsByScope(scopeId: string) {
    return this.prisma.component.groupBy({
      by: ['status'],
      where: { scopeId },
      _count: { status: true },
    });
  }
}
