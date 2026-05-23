import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { RenderService } from './render.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
