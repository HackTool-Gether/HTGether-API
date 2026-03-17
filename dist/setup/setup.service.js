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
exports.SetupService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const SALT_ROUNDS = 12;
let SetupService = class SetupService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async isSetupComplete() {
        const superAdmin = await this.prisma.user.findFirst({
            where: { role: client_1.PlatformRole.SUPER_ADMIN },
        });
        return { isSetup: !!superAdmin };
    }
    async createSuperAdmin(dto) {
        const existing = await this.prisma.user.findFirst({
            where: { role: client_1.PlatformRole.SUPER_ADMIN },
        });
        if (existing) {
            throw new common_1.ForbiddenException('Setup has already been completed');
        }
        const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: client_1.PlatformRole.SUPER_ADMIN,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
        });
        return { message: 'Setup complete', user };
    }
};
exports.SetupService = SetupService;
exports.SetupService = SetupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SetupService);
//# sourceMappingURL=setup.service.js.map