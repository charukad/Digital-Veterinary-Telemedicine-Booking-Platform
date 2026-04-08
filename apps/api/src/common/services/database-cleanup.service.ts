import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DatabaseCleanupService {
  private readonly logger = new Logger(DatabaseCleanupService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Clean up old refresh tokens daily at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredTokens() {
    this.logger.log('Starting expired token cleanup...');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deleted = await this.prisma.user.updateMany({
        where: {
          refreshToken: {
            not: null,
          },
          updatedAt: {
            lt: thirtyDaysAgo,
          },
        },
        data: {
          refreshToken: null,
        },
      });

      this.logger.log(`Cleaned up ${deleted.count} expired tokens`);
    } catch (error) {
      this.logger.error('Error cleaning up tokens:', error);
    }
  }

  /**
   * Clean up cancelled appointments older than 90 days
   */
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOldCancelledAppointments() {
    this.logger.log('Starting old cancelled appointments cleanup...');

    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const deleted = await this.prisma.appointment.deleteMany({
        where: {
          status: 'CANCELLED',
          updatedAt: {
            lt: ninetyDaysAgo,
          },
        },
      });

      this.logger.log(`Cleaned up ${deleted.count} old cancelled appointments`);
    } catch (error) {
      this.logger.error('Error cleaning up appointments:', error);
    }
  }

  /**
   * Archive old completed appointments (optional)
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async archiveOldAppointments() {
    this.logger.log('Starting appointment archival...');

    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      // Count appointments to archive
      const count = await this.prisma.appointment.count({
        where: {
          status: 'COMPLETED',
          scheduledAt: {
            lt: oneYearAgo,
          },
        },
      });

      this.logger.log(`Found ${count} appointments eligible for archival`);
      // Implementation: Move to archive table or update flag
    } catch (error) {
      this.logger.error('Error archiving appointments:', error);
    }
  }
}
