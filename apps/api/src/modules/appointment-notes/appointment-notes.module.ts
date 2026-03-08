import { Module } from '@nestjs/common';
import { AppointmentNotesController } from './appointment-notes.controller';
import { AppointmentNotesService } from './appointment-notes.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppointmentNotesController],
  providers: [AppointmentNotesService],
  exports: [AppointmentNotesService],
})
export class AppointmentNotesModule {}
