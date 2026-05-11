import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UpdateKanbanConfigDto } from './dto/update-kanban-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: any) {
    return this.projectsService.create(dto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.projectsService.findAll(user.id, user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.findOne(id, user.id, user.role);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto, @CurrentUser() user: any) {
    return this.projectsService.update(id, dto, user.id, user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.remove(id, user.id, user.role);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto, @CurrentUser() user: any) {
    return this.projectsService.addMember(id, dto, user.id, user.role);
  }

  @Delete(':id/members/:memberId')
  removeMember(@Param('id') id: string, @Param('memberId') memberId: string, @CurrentUser() user: any) {
    return this.projectsService.removeMember(id, memberId, user.id, user.role);
  }

  @Put(':id/members/:memberId')
  updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.updateMemberRole(id, memberId, dto, user.id, user.role);
  }

  @Get(':id/permissions')
  getPermissions(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.getPermissions(id, user.id, user.role);
  }

  @Put(':id/permissions')
  updatePermissions(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionsDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.updatePermissions(id, dto, user.id, user.role);
  }

  @Put(':id/kanban-config')
  updateKanbanConfig(
    @Param('id') id: string,
    @Body() dto: UpdateKanbanConfigDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.updateKanbanConfig(id, dto, user.id, user.role);
  }
}
