import { IsEmail, IsString, IsOptional } from 'class-validator';

export class LdapLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  providerId?: string;
}
