import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AppointmentNotesService } from './appointment-notes.service';
import {
  CreateAppointmentNoteDto,
  UpdateAppointmentNoteDto,
} from './dto/appointment-note.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('appointment-notes')
@UseGuards(JwtAuthGuard)
export class AppointmentNotesController {
  constructor(private readonly appointmentNotesService: AppointmentNotesService) {}

  @Post()
  create(@Req() req, @Body() createDto: CreateAppointmentNoteDto) {
    return this.appointmentNotesService.create(
      req.user.userId,
      req.user.role,
      createDto,
    );
  }

  @Get('appointment/:appointmentId')
  findAllByAppointment(@Param('appointmentId') appointmentId: string, @Req() req) {
    return this.appointmentNotesService.findAllByAppointment(
      appointmentId,
      req.user.userId,
      req.user.role,
    );
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateDto: UpdateAppointmentNoteDto,
  ) {
    return this.appointmentNotesService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.appointmentNotesService.delete(id, req.user.userId);
  }
}
