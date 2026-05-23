import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ComponentsService } from './components.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('scopes/:scopeId/components')
export class ComponentsController {
  constructor(private componentsService: ComponentsService) {}

  @Get()
  findAll(@Param('scopeId') scopeId: string) {
    return this.componentsService.findAllByScope(scopeId);
  }

  @Get('stats')
  getStats(@Param('scopeId') scopeId: string) {
    return this.componentsService.getStatsByScope(scopeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.componentsService.findOne(id);
  }

  @Post()
  create(
    @Param('scopeId') scopeId: string,
    @Body() dto: CreateComponentDto,
  ) {
    return this.componentsService.create(scopeId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateComponentDto) {
    return this.componentsService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.componentsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.componentsService.remove(id);
  }
}
