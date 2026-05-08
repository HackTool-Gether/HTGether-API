import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FindingsService } from './findings.service';
import { CreateFindingDto } from './dto/create-finding.dto';
import { UpdateFindingDto } from './dto/update-finding.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class FindingsController {
  constructor(private findingsService: FindingsService) {}

  @Post('projects/:projectId/findings')
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateFindingDto,
    @CurrentUser() user: any,
  ) {
    return this.findingsService.create(projectId, dto, user.id, user.role);
  }

  @Get('projects/:projectId/findings')
  findAllByProject(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any,
  ) {
    return this.findingsService.findAllByProject(projectId, user.id, user.role);
  }

  @Get('findings/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.findingsService.findOne(id, user.id, user.role);
  }

  @Put('findings/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFindingDto,
    @CurrentUser() user: any,
  ) {
    return this.findingsService.update(id, dto, user.id, user.role);
  }

  @Delete('findings/:id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.findingsService.remove(id, user.id, user.role);
  }
}
