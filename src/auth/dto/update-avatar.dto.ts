import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateAvatarDto {
  @IsString()
  avatarStyle: string;

  @IsString()
  avatarSeed: string;

  @IsOptional()
  @IsObject()
  avatarOptions?: Record<string, any>;
}
