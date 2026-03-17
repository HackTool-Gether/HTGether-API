import { SetupService } from './setup.service';
import { SetupDto } from './dto/setup.dto';
export declare class SetupController {
    private setupService;
    constructor(setupService: SetupService);
    getStatus(): Promise<{
        isSetup: boolean;
    }>;
    init(dto: SetupDto): Promise<{
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
