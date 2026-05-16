import { IsString, IsEnum } from 'class-validator';
import { ProjectRole } from '@prisma/client';

export class CreateInvitationDto {
  @IsString()
  userId: string;

  @IsEnum(ProjectRole)
  role: ProjectRole;
}
