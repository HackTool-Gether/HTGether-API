import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateScopeDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
