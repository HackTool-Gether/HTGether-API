import { IsString, IsOptional } from 'class-validator';

export class CreateReportDto {
  @IsString()
  name!: string;

  @IsOptional()
  content?: any;

  @IsOptional()
  @IsString()
  templateId?: string;
}
