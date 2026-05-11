import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SetupModule } from './setup/setup.module';
import { AuthProvidersModule } from './auth-providers/auth-providers.module';
import { SettingsModule } from './settings/settings.module';
import { ProjectsModule } from './projects/projects.module';
import { ScopesModule } from './scopes/scopes.module';
import { NotesModule } from './notes/notes.module';
import { FindingsModule } from './findings/findings.module';
import { ReportsModule } from './reports/reports.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SetupModule,
    AuthProvidersModule,
    SettingsModule,
    ProjectsModule,
    ScopesModule,
    NotesModule,
    FindingsModule,
    ReportsModule,
    TasksModule,
  ],
})
export class AppModule {}
