import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentStatisticsService } from './appointment-statistics.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly statisticsService: AppointmentStatisticsService,
  ) {}

  @Get('statistics')
  getStatistics(@Req() req) {
    // Only veterinarians should access this
    if (req.user.role !== 'VETERINARIAN') {
      throw new Error('Only veterinarians can access statistics');
    }
    return this.statisticsService.getVetStatistics(req.user.userId);
  }


  @Post()
  create(@Req() req, @Body() createDto: CreateAppointmentDto) {
    return this.appointmentsService.create(req.user.userId, createDto);
  }

  @Get()
  async findAll(
    @Req() req,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('petId') petId?: string,
  ) {
    return this.appointmentsService.findAll(
      req.user.userId,
      req.user.role,
      { status, startDate, endDate, petId },
    );
  }

  @Get('check-availability')
  checkAvailability(
    @Query('vetId') vetId: string,
    @Query('date') date: string,
    @Query('startTime') startTime: string,
  ) {
    return this.appointmentsService.checkAvailability(vetId, date, startTime);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.appointmentsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  cancel(@Param('id') id: string, @Req() req) {
    return this.appointmentsService.cancel(id, req.user.userId);
  }

  @Patch(':id/reschedule')
  reschedule(
    @Param('id') id: string,
    @Req() req,
    @Body() rescheduleDto: any,
  ) {
    return this.appointmentsService.reschedule(id, req.user.userId, rescheduleDto);
  }
}
