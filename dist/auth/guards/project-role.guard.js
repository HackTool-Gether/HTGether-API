"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectRoleGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const client_1 = require("@prisma/client");
const project_roles_decorator_1 = require("../decorators/project-roles.decorator");
const prisma_service_1 = require("../../prisma/prisma.service");
let ProjectRoleGuard = class ProjectRoleGuard {
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(project_roles_decorator_1.PROJECT_ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredRoles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const projectId = request.params.projectId;
        if (!projectId) {
            throw new common_1.ForbiddenException('Project ID is required');
        }
        if (user.role === client_1.PlatformRole.SUPER_ADMIN) {
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
            throw new common_1.ForbiddenException('You are not a member of this project');
        }
        if (!requiredRoles.includes(member.role)) {
            throw new common_1.ForbiddenException('You do not have the required role for this action');
        }
        request.projectMember = member;
        return true;
    }
};
exports.ProjectRoleGuard = ProjectRoleGuard;
exports.ProjectRoleGuard = ProjectRoleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], ProjectRoleGuard);
//# sourceMappingURL=project-role.guard.js.map