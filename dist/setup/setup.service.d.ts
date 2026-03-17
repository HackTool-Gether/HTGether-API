import { PrismaService } from '../prisma/prisma.service';
import { SetupDto } from './dto/setup.dto';
export declare class SetupService {
    private prisma;
    constructor(prisma: PrismaService);
    isSetupComplete(): Promise<{
        isSetup: boolean;
    }>;
    createSuperAdmin(dto: SetupDto): Promise<{
        message: string;
        user: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.PlatformRole;
            createdAt: Date;
        };
    }>;
}
