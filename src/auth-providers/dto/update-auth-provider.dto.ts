import { IsString, IsOptional, IsBoolean, IsObject, IsInt } from 'class-validator';

export class UpdateAuthProviderDto {
  @IsString()
  @IsOptional()
  name?: string;

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
