import { Controller, Get, Post, Body } from '@nestjs/common';
import { SetupService } from './setup.service';
import { SetupDto } from './dto/setup.dto';
import { OnboardingDto } from './dto/onboarding.dto';

@Controller('setup')
export class SetupController {
  constructor(private setupService: SetupService) {}

  @Get('status')
  async getStatus() {
    return this.setupService.isSetupComplete();
  }

  @Post('init')
  async init(@Body() dto: SetupDto) {
    return this.setupService.createSuperAdmin(dto);
  }

  @Post('onboarding')
  async onboarding(@Body() dto: OnboardingDto) {
    return this.setupService.completeOnboarding(dto);
  }
}
