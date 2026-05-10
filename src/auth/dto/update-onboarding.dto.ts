import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateOnboardingDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  step?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
