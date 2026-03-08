import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { AppointmentReminderService } from './appointment-reminder.service';
import { AppointmentStatisticsService } from './appointment-statistics.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [NotificationsModule, PrismaModule],
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
    AppointmentReminderService,
    AppointmentStatisticsService,
  ],
  exports: [
    AppointmentsService,
    AppointmentStatisticsService,
    AppointmentReminderService,
  ],
})
export class AppointmentsModule {}
