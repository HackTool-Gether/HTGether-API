import { IsString, IsDateString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { AuditType } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  clientCompany: string;

  @IsString()
  clientNeed: string;

  @IsString()
  context: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(AuditType)
  auditType: AuditType;

  @IsOptional()
  @IsString()
  templateId?: string;
}
