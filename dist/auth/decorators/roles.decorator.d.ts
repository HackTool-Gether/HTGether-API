import { PlatformRole } from '@prisma/client';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: PlatformRole[]) => import("@nestjs/common").CustomDecorator<string>;
