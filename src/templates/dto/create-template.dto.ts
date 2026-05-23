import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TemplateVariableDto {
  @IsString()
  id: string;

  @IsString()
  label: string;

  @IsString()
  type: string; // string | markdown | date | number | boolean | enum | image

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  defaultValue?: any;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsArray()
  options?: { value: string; label: string }[];

  @IsOptional()
  @IsString()
  helpText?: string;
}

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  htmlContent?: string;

  @IsOptional()
  @IsString()
  cssContent?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateVariableDto)
  variables?: TemplateVariableDto[];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
