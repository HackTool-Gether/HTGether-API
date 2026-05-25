import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { SettingsModule } from '../settings/settings.module';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';

@Module({
  imports: [SettingsModule, KnowledgeBaseModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
