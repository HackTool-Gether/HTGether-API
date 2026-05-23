import { IsEmail, IsString, MinLength, IsOptional, IsBoolean, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class OnboardingAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;
}

export class OnboardingCompanyDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  domain?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}

export class OnboardingAuthProviderDto {
  @IsString()
  type: string; // 'LOCAL' | 'GOOGLE' | 'GITHUB' | 'AZURE_AD' | 'CUSTOM_OIDC'

  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  config?: Record<string, any>;
}

export class OnboardingAuthDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OnboardingAuthProviderDto)
  providers: OnboardingAuthProviderDto[];
}

export class OnboardingAiDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  @IsOptional()
  provider?: string; // 'openai' | 'gemini' | 'mistral' | 'anthropic'

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  model?: string;
}

export class OnboardingSmtpDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  @IsOptional()
  provider?: string; // 'smtp' | 'mailgun'

  // SMTP fields
  @IsString()
  @IsOptional()
  host?: string;

  @IsOptional()
  port?: number;

  @IsString()
  @IsOptional()
  user?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  fromEmail?: string;

  @IsString()
  @IsOptional()
  fromName?: string;

  @IsBoolean()
  @IsOptional()
  secure?: boolean;

  // Mailgun fields
  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  domain?: string;
}

export class OnboardingDto {
  @ValidateNested()
  @Type(() => OnboardingAdminDto)
  @IsOptional()
  admin?: OnboardingAdminDto;

  @ValidateNested()
  @Type(() => OnboardingCompanyDto)
  company: OnboardingCompanyDto;

  @ValidateNested()
  @Type(() => OnboardingAuthDto)
  auth: OnboardingAuthDto;

  @ValidateNested()
  @Type(() => OnboardingAiDto)
  ai: OnboardingAiDto;

  @ValidateNested()
  @Type(() => OnboardingSmtpDto)
  @IsOptional()
  smtp?: OnboardingSmtpDto;
}
