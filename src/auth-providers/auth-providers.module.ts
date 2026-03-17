import { Module } from '@nestjs/common';
import { AuthProvidersService } from './auth-providers.service';
import { AuthProvidersController } from './auth-providers.controller';

@Module({
  providers: [AuthProvidersService],
  controllers: [AuthProvidersController],
  exports: [AuthProvidersService],
})
export class AuthProvidersModule {}
