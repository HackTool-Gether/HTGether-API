import { IsObject } from 'class-validator';

export class UpdatePermissionsDto {
  @IsObject()
  overrides: Record<string, Record<string, boolean>>;
}
