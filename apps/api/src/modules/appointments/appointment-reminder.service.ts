import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class AppointmentReminderService {
  private readonly logger = new Logger(AppointmentReminderService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleReminders() {
    this.logger.log('Running appointment reminders cron job...');

    // Find appointments in the next 24 hours that haven't been reminded yet
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setHours(dayAfterTomorrow.getHours() + 1); // Check a 1-hour window

    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        status: 'CONFIRMED',
        scheduledAt: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
        // In a real app, you'd track if a reminder was already sent
        // For now, we'll assume the 1-hour window handles it
      },
      include: {
        owner: {
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        pet: {
          select: {
            name: true,
          },
        },
        veterinarian: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        clinic: true,
      },
    });

    this.logger.log(`Found ${upcomingAppointments.length} appointments for reminders.`);

    for (const appointment of upcomingAppointments) {
      try {
        await this.sendReminderEmail(appointment);
      } catch (error) {
        this.logger.error(`Failed to send reminder for appointment ${appointment.id}:`, error);
      }
    }
  }

  private async sendReminderEmail(appointment: any) {
    const user = appointment.owner?.user;
    if (!user?.email) return;

    const ownerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Pet Owner';
    const petName = appointment.pet.name;
    const vetUser = appointment.veterinarian?.user;
    const vetName = vetUser 
      ? `Dr. ${vetUser.firstName || ''} ${vetUser.lastName || ''}`.trim() 
      : 'Veterinarian';

    await this.emailService.sendAppointmentReminder({
      to: user.email,
      ownerName,
      petName,
      vetName,
      date: appointment.scheduledAt,
      clinicName: appointment.clinic?.name || 'VetCare Clinic',
      location: appointment.type === 'TELEMEDICINE' ? 'Online (Video Consultation)' : (appointment.clinic?.address || 'Clinic Address'),
    });

    this.logger.log(`Reminder sent to ${user.email} for appointment ${appointment.id}`);
  }
}
