import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { PlatformRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsOptional()
  @IsEnum(PlatformRole)
  role?: PlatformRole;
}
