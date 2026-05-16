import { IsEmail, IsOptional, IsString, IsEnum, IsObject } from 'class-validator';
import { PlatformRole } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(PlatformRole)
  role?: PlatformRole;

  @IsOptional()
  @IsObject()
  platformPermissions?: Record<string, boolean>;

  @IsOptional()
  @IsString()
  avatarStyle?: string;

  @IsOptional()
  @IsString()
  avatarSeed?: string;

  @IsOptional()
  @IsObject()
  avatarOptions?: Record<string, any>;
}
