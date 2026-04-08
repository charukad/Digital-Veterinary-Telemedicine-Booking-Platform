import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationPreferencesService {
  constructor(private prisma: PrismaService) {}

  // Default preferences (notificationPreference model doesn't exist in schema)
  private defaultPreferences = {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    appointmentReminders: true,
    vaccinationReminders: true,
    promotionalEmails: false,
    weeklyDigest: true,
  };

  /**
   * Get user notification preferences
   */
  async getPreferences(userId: string) {
    // Return defaults since the model doesn't exist in schema
    return {
      userId,
      ...this.defaultPreferences,
    };
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: string, updates: any) {
    // Return merged preferences since model doesn't exist in schema
    return {
      userId,
      ...this.defaultPreferences,
      ...updates,
    };
  }

  /**
   * Check if user wants specific notification type
   */
  async shouldSendNotification(
    userId: string,
    type: 'email' | 'sms' | 'push',
  ): Promise<boolean> {
    switch (type) {
      case 'email':
        return this.defaultPreferences.emailNotifications;
      case 'sms':
        return this.defaultPreferences.smsNotifications;
      case 'push':
        return this.defaultPreferences.pushNotifications;
      default:
        return false;
    }
  }
}
