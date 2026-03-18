import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ScopesService } from './scopes.service';
import { CreateScopeDto } from './dto/create-scope.dto';
import { UpdateScopeDto } from './dto/update-scope.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/scopes')
export class ScopesController {
  constructor(private scopesService: ScopesService) {}

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateScopeDto,
    @CurrentUser() user: any,
  ) {
    return this.scopesService.create(projectId, dto, user.id, user.role);
  }

  @Get()
  findAll(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.scopesService.findAllByProject(projectId, user.id, user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.scopesService.findOne(id, user.id, user.role);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateScopeDto, @CurrentUser() user: any) {
    return this.scopesService.update(id, dto, user.id, user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.scopesService.remove(id, user.id, user.role);
  }
}
