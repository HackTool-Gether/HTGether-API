import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAttackChainDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
