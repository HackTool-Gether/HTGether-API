import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SetupModule } from './setup/setup.module';
import { AuthProvidersModule } from './auth-providers/auth-providers.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SetupModule,
    AuthProvidersModule,
    SettingsModule,
  ],
})
export class AppModule {}
