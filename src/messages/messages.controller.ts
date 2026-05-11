import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MessagesService } from './messages.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('projects/:projectId/conversations')
  getConversations(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.messagesService.getConversationsByProject(projectId, user.id);
  }

  @Post('projects/:projectId/conversations')
  createConversation(
    @Param('projectId') projectId: string,
    @Body() dto: CreateConversationDto,
    @CurrentUser() user: any,
  ) {
    return this.messagesService.getOrCreateConversation(
      projectId,
      user.id,
      dto.targetUserId,
    );
  }

  @Get('conversations/:id/messages')
  getMessages(
    @Param('id') id: string,
    @Query('cursor') cursor: string,
    @Query('limit') limit: string,
    @CurrentUser() user: any,
  ) {
    return this.messagesService.getMessages(
      id,
      user.id,
      cursor || undefined,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}
