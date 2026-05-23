import { Module } from '@nestjs/common';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { RenderService } from './render.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TemplatesController],
  providers: [TemplatesService, RenderService],
  exports: [TemplatesService, RenderService],
})
export class TemplatesModule {}
