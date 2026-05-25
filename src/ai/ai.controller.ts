import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AiService } from './ai.service';
import { GenerateDto } from './dto/generate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('generate')
  async generate(
    @Body() dto: GenerateDto,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      for await (const chunk of this.aiService.generate(
        user.id,
        dto.content,
        dto.images || [],
        dto.projectId,
        dto.action,
      )) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ error: err.message || 'Erreur IA' })}\n\n`);
    }

    res.end();
  }
}
