import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateKbEntryDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;
}
