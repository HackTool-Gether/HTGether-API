import { IsEnum, IsString, IsOptional, IsBoolean, IsObject, IsInt } from 'class-validator';
import { AuthProviderType } from '@prisma/client';

export class CreateAuthProviderDto {
  @IsEnum(AuthProviderType)
  type: AuthProviderType;

  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @IsInt()
  @IsOptional()
  displayOrder?: number;
}
