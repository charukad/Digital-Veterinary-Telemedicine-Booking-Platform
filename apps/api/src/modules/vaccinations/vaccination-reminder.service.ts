import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class VaccinationReminderService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Send vaccination reminders daily at 9 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendVaccinationReminders() {
    const today = new Date();
    const reminderWindow = new Date(today);
    reminderWindow.setDate(reminderWindow.getDate() + 7); // 7 days ahead

    // Find vaccinations due in the next 7 days
    const upcomingVaccinations = await this.prisma.vaccination.findMany({
      where: {
        nextDueDate: {
          gte: today,
          lte: reminderWindow,
        },
      },
      include: {
        pet: {
          include: {
            owner: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    for (const vaccination of upcomingVaccinations) {
      const daysUntilDue = vaccination.nextDueDate
        ? Math.ceil(
            (vaccination.nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          )
        : 0;

      await this.emailService.sendEmail({
        to: vaccination.pet.owner.user.email,
        subject: `Vaccination Reminder for ${vaccination.pet.name}`,
        html: `
          <h2>Vaccination Due Soon</h2>
          <p>Hi ${vaccination.pet.owner.firstName},</p>
          <p>This is a reminder that ${vaccination.pet.name} has a vaccination due in ${daysUntilDue} day(s).</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Pet:</strong> ${vaccination.pet.name}</p>
            <p><strong>Vaccine:</strong> ${vaccination.vaccineName}</p>
            <p><strong>Due Date:</strong> ${vaccination.nextDueDate?.toLocaleDateString() ?? 'N/A'}</p>
          </div>
          <p>Please schedule an appointment with your veterinarian.</p>
          <p>Best regards,<br/>VetCare Sri Lanka</p>
        `,
      });
    }
  }
}
