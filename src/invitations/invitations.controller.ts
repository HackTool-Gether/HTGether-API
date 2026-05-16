import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @Post('projects/:projectId/invitations')
  invite(
    @Param('projectId') projectId: string,
    @Body() dto: CreateInvitationDto,
    @CurrentUser() user: any,
  ) {
    return this.invitationsService.invite(projectId, dto, user.id, user.role);
  }

  @Get('projects/:projectId/invitations')
  getProjectInvitations(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any,
  ) {
    return this.invitationsService.getProjectInvitations(projectId, user.id, user.role);
  }

  @Get('invitations/mine')
  getMyInvitations(@CurrentUser() user: any) {
    return this.invitationsService.getMyInvitations(user.id);
  }

  @Post('invitations/:id/accept')
  accept(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invitationsService.accept(id, user.id);
  }

  @Post('invitations/:id/decline')
  decline(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invitationsService.decline(id, user.id);
  }

  @Delete('invitations/:id')
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invitationsService.cancel(id, user.id, user.role);
  }
}
