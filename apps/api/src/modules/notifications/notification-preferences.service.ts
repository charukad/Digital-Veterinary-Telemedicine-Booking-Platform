import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationPreferencesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user notification preferences
   */
  async getPreferences(userId: string) {
    let preferences = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if not exists
    if (!preferences) {
      preferences = await this.prisma.notificationPreference.create({
        data: {
          userId,
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          appointmentReminders: true,
          vaccinationReminders: true,
          promotionalEmails: false,
          weeklyDigest: true,
        },
      });
    }

    return preferences;
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: string, updates: any) {
    const preferences = await this.prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...updates,
      },
      update: updates,
    });

    return preferences;
  }

  /**
   * Check if user wants specific notification type
   */
  async shouldSendNotification(
    userId: string,
    type: 'email' | 'sms' | 'push',
  ): Promise<boolean> {
    const prefs = await this.getPreferences(userId);

    switch (type) {
      case 'email':
        return prefs.emailNotifications;
      case 'sms':
        return prefs.smsNotifications;
      case 'push':
        return prefs.pushNotifications;
      default:
        return false;
    }
  }
}
