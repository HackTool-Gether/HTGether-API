import { PartialType } from '@nestjs/mapped-types';
import { CreateTemplateDto } from './create-template.dto';
import { IsOptional } from 'class-validator';

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {
  @IsOptional()
  previewData?: Record<string, any>;
}
