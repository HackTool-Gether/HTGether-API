import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRemarkDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
