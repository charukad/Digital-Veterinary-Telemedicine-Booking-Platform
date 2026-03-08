import { Controller, Get, Put, Param, Body, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateNotificationPreferencesDto } from './dto/notification-preferences.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Get('notifications/preferences')
  getNotificationPreferences(@Req() req) {
    return this.usersService.getNotificationPreferences(req.user.userId);
  }

  @Put('notifications/preferences')
  updateNotificationPreferences(@Req() req, @Body() preferences: UpdateNotificationPreferencesDto) {
    return this.usersService.updateNotificationPreferences(req.user.userId, preferences);
  }
}
