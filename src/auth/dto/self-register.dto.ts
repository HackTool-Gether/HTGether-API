import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class SelfRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  avatarStyle?: string;

  @IsOptional()
  @IsString()
  avatarSeed?: string;

  @IsOptional()
  avatarOptions?: any;
}
