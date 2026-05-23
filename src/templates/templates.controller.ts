import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { extname, join } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { TemplatesService } from './templates.service';
import { RenderService } from './render.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const UPLOADS_DIR = join(process.cwd(), 'uploads', 'assets');

@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplatesController {
  constructor(
    private templatesService: TemplatesService,
    private renderService: RenderService,
  ) {}

  @Get()
  findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTemplateDto) {
    return this.templatesService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.templatesService.update(id, dto);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.templatesService.duplicate(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }

  @Get(':id/assets')
  getAssets(@Param('id') id: string) {
    return this.templatesService.getAssets(id);
  }

  @Post(':id/assets')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (_req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAsset(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const filePath = `/api/templates/assets/file/${file.filename}`;
    return this.templatesService.addAsset(id, file.originalname, filePath, file.mimetype);
  }

  @Get('assets/file/:filename')
  serveAsset(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(UPLOADS_DIR, filename);
    if (!existsSync(filePath)) throw new NotFoundException('Fichier introuvable');
    return res.sendFile(filePath);
  }

  @Delete('assets/:assetId')
  removeAsset(@Param('assetId') assetId: string) {
    return this.templatesService.removeAsset(assetId);
  }

  @Get(':id/preview')
  preview(@Param('id') id: string) {
    return this.renderService.previewTemplate(id);
  }

  @Get(':id/render/:projectId')
  render(@Param('id') id: string, @Param('projectId') projectId: string) {
    return this.renderService.renderProject(projectId);
  }
}
