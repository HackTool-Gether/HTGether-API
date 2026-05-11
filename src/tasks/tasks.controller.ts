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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post('projects/:projectId/tasks')
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.create(projectId, dto, user.id, user.role);
  }

  @Get('projects/:projectId/tasks')
  findAllByProject(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.findAllByProject(projectId, user.id, user.role);
  }

  @Get('tasks/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.findOne(id, user.id, user.role);
  }

  @Put('tasks/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.update(id, dto, user.id, user.role);
  }

  @Patch('tasks/:id/move')
  move(
    @Param('id') id: string,
    @Body() dto: MoveTaskDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.move(id, dto, user.id, user.role);
  }

  @Delete('tasks/:id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.remove(id, user.id, user.role);
  }
}
