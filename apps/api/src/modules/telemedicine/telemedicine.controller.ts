import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { TelemedicineService } from './telemedicine.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('telemedicine')
@UseGuards(JwtAuthGuard)
export class TelemedicineController {
  constructor(private readonly telemedicineService: TelemedicineService) {}

  @Get('token/:appointmentId')
  async getToken(@Param('appointmentId') appointmentId: string, @Req() req) {
    return this.telemedicineService.generateToken(appointmentId, req.user.userId);
  }
}
