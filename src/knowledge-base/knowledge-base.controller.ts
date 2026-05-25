import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateKbEntryDto } from './dto/create-kb-entry.dto';
import { UpdateKbEntryDto } from './dto/update-kb-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

const KB_UPLOADS_DIR = 'uploads/kb';

const fileInterceptor = FileInterceptor('file', {
  storage: diskStorage({
    destination: KB_UPLOADS_DIR,
    filename: (_req, file, cb) => {
      cb(null, `${uuidv4()}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.md', '.txt'];
    const ext = extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

@UseGuards(JwtAuthGuard)
@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private kbService: KnowledgeBaseService) {}

  @Get('enterprise')
  findAllEnterprise(@CurrentUser() user: any) {
    if (user.role !== 'SUPER_ADMIN') return [];
    return this.kbService.findAllEnterprise();
  }

  @Post('enterprise')
  createEnterprise(@Body() dto: CreateKbEntryDto, @CurrentUser() user: any) {
    if (user.role !== 'SUPER_ADMIN') return;
    return this.kbService.createEnterprise(dto);
  }

  @Post('enterprise/upload')
  @UseInterceptors(fileInterceptor)
  uploadEnterprise(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    if (user.role !== 'SUPER_ADMIN') return;
    return this.kbService.uploadEnterprise(file);
  }

  @Get('mine')
  findAllMine(@CurrentUser() user: any) {
    return this.kbService.findAllMine(user.id);
  }

  @Post('mine')
  createMine(@Body() dto: CreateKbEntryDto, @CurrentUser() user: any) {
    return this.kbService.createMine(dto, user.id);
  }

  @Post('mine/upload')
  @UseInterceptors(fileInterceptor)
  uploadMine(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    return this.kbService.uploadMine(file, user.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateKbEntryDto, @CurrentUser() user: any) {
    return this.kbService.update(id, dto, user.id, user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.kbService.remove(id, user.id, user.role);
  }

  @Get('context')
  getContext(@Query('projectId') projectId: string, @CurrentUser() user: any) {
    return this.kbService.getContext(user.id, projectId);
  }
}
