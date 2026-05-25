import { IsString, IsDateString, IsEnum, IsOptional, MinLength, IsBoolean, IsArray } from 'class-validator';
import { AuditType, ProjectStatus } from '@prisma/client';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  clientCompany?: string;

  @IsOptional()
  @IsString()
  clientNeed?: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(AuditType)
  auditType?: AuditType;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsBoolean()
  aiEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aiScopeIds?: string[];
}
