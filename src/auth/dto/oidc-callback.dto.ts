import { IsString } from 'class-validator';

export class OidcCallbackDto {
  @IsString()
  providerId: string;

  @IsString()
  currentUrl: string;

  @IsString()
  redirectUri: string;
}
