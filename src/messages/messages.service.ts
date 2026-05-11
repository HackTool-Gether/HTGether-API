import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getConversationsByProject(projectId: string, userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        projectId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: { id: true, firstName: true, lastName: true, email: true } },
        user2: { select: { id: true, firstName: true, lastName: true, email: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map((c) => ({
      id: c.id,
      projectId: c.projectId,
      user1: c.user1,
      user2: c.user2,
      lastMessage: c.messages[0] || null,
      updatedAt: c.updatedAt,
    }));
  }

  async getOrCreateConversation(projectId: string, userId: string, targetUserId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (!member) throw new ForbiddenException('Vous ne faites pas partie de ce projet');

    const targetMember = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: targetUserId, projectId } },
    });
    if (!targetMember) throw new NotFoundException('Utilisateur cible non membre du projet');

    const [u1, u2] = userId < targetUserId ? [userId, targetUserId] : [targetUserId, userId];

    const existing = await this.prisma.conversation.findUnique({
      where: { projectId_user1Id_user2Id: { projectId, user1Id: u1, user2Id: u2 } },
      include: {
        user1: { select: { id: true, firstName: true, lastName: true, email: true } },
        user2: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (existing) return existing;

    return this.prisma.conversation.create({
      data: { projectId, user1Id: u1, user2Id: u2 },
      include: {
        user1: { select: { id: true, firstName: true, lastName: true, email: true } },
        user2: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async getMessages(conversationId: string, userId: string, cursor?: string, limit = 50) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation introuvable');
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    return this.prisma.message.findMany({
      where: {
        conversationId,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation introuvable');
    if (conversation.user1Id !== senderId && conversation.user2Id !== senderId) {
      throw new ForbiddenException('Accès refusé');
    }

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: { content, conversationId, senderId },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return { message, conversation };
  }
}
