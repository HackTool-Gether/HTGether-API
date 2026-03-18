import { IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ScopeStatus } from '@prisma/client';

export class UpdateScopeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ScopeStatus)
  status?: ScopeStatus;
}
