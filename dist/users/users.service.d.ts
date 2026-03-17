import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserDto): Promise<{
        email: string;
        id: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.PlatformRole;
        isActive: boolean;
        createdAt: Date;
    }>;
    findAll(): Promise<{
        email: string;
        id: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.PlatformRole;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        email: string;
        id: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.PlatformRole;
        isActive: boolean;
        createdAt: Date;
        projectMembers: {
            project: {
                id: string;
                name: string;
                clientCompany: string;
                status: import(".prisma/client").$Enums.ProjectStatus;
            };
            role: import(".prisma/client").$Enums.ProjectRole;
        }[];
    }>;
    toggleActive(id: string): Promise<{
        email: string;
        id: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.PlatformRole;
        isActive: boolean;
    }>;
}
