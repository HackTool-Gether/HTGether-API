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
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  // ── Legacy endpoints (backward-compatible) ──────────────────────────

  @Get('projects/:projectId/report')
  get(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.reportsService.getOrCreate(projectId, user.id, user.role);
  }

  @Put('projects/:projectId/report')
  update(
    @Param('projectId') projectId: string,
    @Body() body: { content: any },
    @CurrentUser() user: any,
  ) {
    return this.reportsService.update(
      projectId,
      body.content,
      user.id,
      user.role,
    );
  }

  // ── New multi-report endpoints ──────────────────────────────────────

  @Get('projects/:projectId/reports')
  findAll(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any,
  ) {
    return this.reportsService.findAll(projectId, user.id, user.role);
  }

  @Post('projects/:projectId/reports')
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateReportDto,
    @CurrentUser() user: any,
  ) {
    return this.reportsService.create(projectId, dto, user.id, user.role);
  }

  @Get('reports/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reportsService.findOne(id, user.id, user.role);
  }

  @Put('reports/:id')
  updateOne(
    @Param('id') id: string,
    @Body() dto: UpdateReportDto,
    @CurrentUser() user: any,
  ) {
    return this.reportsService.updateOne(id, dto, user.id, user.role);
  }

  @Delete('reports/:id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reportsService.remove(id, user.id, user.role);
  }
}
