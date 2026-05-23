import { IsArray, IsString } from 'class-validator';

export class SetFindingsDto {
  @IsArray()
  @IsString({ each: true })
  findingIds: string[];
}
