import { IsObject } from 'class-validator';

export class UpdateKanbanConfigDto {
  @IsObject()
  labels: Record<string, string>;
}
