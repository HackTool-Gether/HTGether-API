import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class NotesController {
  constructor(private notesService: NotesService) {}

  // Scoped routes: /projects/:projectId/scopes/:scopeId/notes
  @Post('projects/:projectId/scopes/:scopeId/notes')
  create(
    @Param('scopeId') scopeId: string,
    @Body() dto: CreateNoteDto,
    @CurrentUser() user: any,
  ) {
    return this.notesService.create(scopeId, dto, user.id, user.role);
  }

  @Get('projects/:projectId/scopes/:scopeId/notes')
  findAllByScope(@Param('scopeId') scopeId: string, @CurrentUser() user: any) {
    return this.notesService.findAllByScope(scopeId, user.id, user.role);
  }

  // Direct routes: /notes/:id
  @Get('notes/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notesService.findOne(id, user.id, user.role);
  }

  @Put('notes/:id')
  update(@Param('id') id: string, @Body() dto: UpdateNoteDto, @CurrentUser() user: any) {
    return this.notesService.update(id, dto, user.id, user.role);
  }

  @Delete('notes/:id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notesService.remove(id, user.id, user.role);
  }
}
