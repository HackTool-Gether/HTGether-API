import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId: string;
  userInfo: { id: string; firstName: string; lastName: string };
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/chat',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, Set<string>>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private messagesService: MessagesService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, firstName: true, lastName: true, isActive: true },
      });

      if (!user || !user.isActive) {
        client.disconnect();
        return;
      }

      client.userId = user.id;
      client.userInfo = { id: user.id, firstName: user.firstName, lastName: user.lastName };
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (!client.userId) return;

    this.onlineUsers.forEach((users, projectId) => {
      if (users.has(client.userId)) {
        users.delete(client.userId);
        this.server.to(`project:${projectId}`).emit('user-offline', {
          userId: client.userId,
        });
        if (users.size === 0) this.onlineUsers.delete(projectId);
      }
    });
  }

  @SubscribeMessage('join-project')
  handleJoinProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { projectId: string },
  ) {
    if (!client.userId) return;

    const room = `project:${data.projectId}`;
    client.join(room);

    if (!this.onlineUsers.has(data.projectId)) {
      this.onlineUsers.set(data.projectId, new Set());
    }
    this.onlineUsers.get(data.projectId)!.add(client.userId);

    client.to(room).emit('user-online', {
      userId: client.userId,
      user: client.userInfo,
    });

    const online = Array.from(this.onlineUsers.get(data.projectId) || []);
    client.emit('online-users', { projectId: data.projectId, userIds: online });
  }

  @SubscribeMessage('leave-project')
  handleLeaveProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { projectId: string },
  ) {
    if (!client.userId) return;

    const room = `project:${data.projectId}`;
    client.leave(room);

    const projectUsers = this.onlineUsers.get(data.projectId);
    if (projectUsers) {
      projectUsers.delete(client.userId);
      this.server.to(room).emit('user-offline', { userId: client.userId });
      if (projectUsers.size === 0) this.onlineUsers.delete(data.projectId);
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    if (!client.userId) return;

    try {
      const { message, conversation } = await this.messagesService.sendMessage(
        data.conversationId,
        client.userId,
        data.content,
      );

      const otherUserId =
        conversation.user1Id === client.userId
          ? conversation.user2Id
          : conversation.user1Id;

      client.emit('new-message', message);

      const room = `project:${conversation.projectId}`;
      const sockets = await this.server.in(room).fetchSockets();
      for (const s of sockets) {
        const authedSocket = s as unknown as AuthenticatedSocket;
        if (authedSocket.userId === otherUserId) {
          authedSocket.emit('new-message', message);
        }
      }
    } catch {
      client.emit('error', { message: "Erreur lors de l'envoi du message" });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; projectId: string },
  ) {
    if (!client.userId) return;

    const room = `project:${data.projectId}`;
    client.to(room).emit('user-typing', {
      userId: client.userId,
      conversationId: data.conversationId,
      user: client.userInfo,
    });
  }

  @SubscribeMessage('stop-typing')
  handleStopTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; projectId: string },
  ) {
    if (!client.userId) return;

    const room = `project:${data.projectId}`;
    client.to(room).emit('user-stop-typing', {
      userId: client.userId,
      conversationId: data.conversationId,
    });
  }
}
