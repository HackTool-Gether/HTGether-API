import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

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
}
