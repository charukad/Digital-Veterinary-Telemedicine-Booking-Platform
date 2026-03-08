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

                firstName: true,
                lastName: true,
              },
            },
          },
        },
        pet: {
          select: {
            name: true,
            species: true,
          },
        },
        veterinarian: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        clinic: {
          select: {
            name: true,
            address: true,
            city: true,
            phone: true,
          },
        },
      },
    });
  }

  private async sendReminderEmail(appointment: any) {
    const ownerEmail = appointment.petOwner.user.email;
    const ownerName = `${appointment.petOwner.user.firstName} ${appointment.petOwner.user.lastName}`;
    const petName = appointment.pet.name;
    const vetName = appointment.veterinarian.user.firstName
      ? `Dr. ${appointment.veterinarian.user.firstName} ${appointment.veterinarian.user.lastName}`
      : 'your veterinarian';

    await this.emailService.sendAppointmentReminder(
      ownerEmail,
      ownerName,
      petName,
      vetName,
      appointment.appointmentDate,
      appointment.clinic,
    );

    this.logger.log(`Reminder sent to ${ownerEmail} for appointment ${appointment.id}`);
  }
}
