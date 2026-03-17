import { ProjectRole } from '@prisma/client';
export declare const PROJECT_ROLES_KEY = "projectRoles";
export declare const ProjectRoles: (...roles: ProjectRole[]) => import("@nestjs/common").CustomDecorator<string>;
