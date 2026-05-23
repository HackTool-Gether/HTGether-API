import { IsString, IsOptional } from 'class-validator';

export class UpdateReportDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  content?: any;

  @IsOptional()
  @IsString()
  templateId?: string;
}
