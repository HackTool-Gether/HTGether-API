import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlatformRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSION_KEY } from '../decorators/permissions.decorator';
import { hasPermission, PermissionKey } from '../permissions';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<PermissionKey>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const projectId = request.params.projectId || request.params.id;

    if (!projectId) {
      throw new ForbiddenException('Project ID is required');
    }

    if (user.role === PlatformRole.SUPER_ADMIN) return true;

    const member = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { rolePermissions: true },
    });

    const overrides = (project?.rolePermissions ?? {}) as Record<
      string,
      Record<string, boolean>
    >;

    if (!hasPermission(member.role, permission, overrides)) {
      throw new ForbiddenException(
        'You do not have permission for this action',
      );
    }

    request.projectMember = member;
    return true;
  }
}
