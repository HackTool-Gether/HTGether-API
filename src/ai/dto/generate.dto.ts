import { IsString, IsOptional, IsArray, IsIn } from 'class-validator';

export class GenerateDto {
  @IsString()
  content: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsIn(['reformulate', 'generate', 'complete'])
  action: string;
}
