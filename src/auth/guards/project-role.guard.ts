import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectRole, PlatformRole } from '@prisma/client';
import { PROJECT_ROLES_KEY } from '../decorators/project-roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ProjectRole[]>(
      PROJECT_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const projectId = request.params.projectId;

    if (!projectId) {
      throw new ForbiddenException('Project ID is required');
    }

    // Super Admin bypasses project role checks
    if (user.role === PlatformRole.SUPER_ADMIN) {
      return true;
    }

    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    if (!requiredRoles.includes(member.role)) {
      throw new ForbiddenException(
        'You do not have the required role for this action',
      );
    }

    // Attach member info to request for downstream use
    request.projectMember = member;
    return true;
  }
}
