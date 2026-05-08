import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Severity, FindingStatus } from '@prisma/client';

export class UpdateFindingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  cvssScore?: number;

  @IsOptional()
  @IsString()
  cvssVector?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  proof?: string;

  @IsOptional()
  @IsString()
  impact?: string;

  @IsOptional()
  @IsString()
  remediation?: string;

  @IsOptional()
  @IsString()
  references?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsEnum(FindingStatus)
  status?: FindingStatus;

  @IsOptional()
  @IsString()
  componentId?: string;

  @IsOptional()
  @IsString()
  noteId?: string;
}
