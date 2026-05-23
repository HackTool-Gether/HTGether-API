import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AttackChainsService } from './attack-chains.service';
import { CreateAttackChainDto } from './dto/create-attack-chain.dto';
import { UpdateAttackChainDto } from './dto/update-attack-chain.dto';
import { SetFindingsDto } from './dto/set-findings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class AttackChainsController {
  constructor(private service: AttackChainsService) {}

  @Get('projects/:projectId/attack-chains')
  findAll(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.service.findAllByProject(projectId, user.id, user.role);
  }

  @Post('projects/:projectId/attack-chains')
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateAttackChainDto,
    @CurrentUser() user: any,
  ) {
    return this.service.create(projectId, dto, user.id, user.role);
  }

  @Get('attack-chains/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user.id, user.role);
  }

  @Put('attack-chains/:id')
  update(@Param('id') id: string, @Body() dto: UpdateAttackChainDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user.id, user.role);
  }

  @Delete('attack-chains/:id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user.id, user.role);
  }

  @Put('attack-chains/:id/findings')
  setFindings(@Param('id') id: string, @Body() dto: SetFindingsDto, @CurrentUser() user: any) {
    return this.service.setFindings(id, dto.findingIds, user.id, user.role);
  }
}
