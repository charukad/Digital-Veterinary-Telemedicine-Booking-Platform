import { Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus } from '@vetcare/types';
import { PrismaService } from '../../prisma/prisma.service';

export interface MonthlyStats {
  month: string;
  year: number;
  total: number;
  completed: number;
  cancelled: number;
}

@Injectable()
export class AppointmentStatisticsService {
  constructor(private readonly prisma: PrismaService) { }

  async getVetStatistics(vetId: string) {
    // Verify vet exists
    const vet = await this.prisma.veterinarian.findUnique({
      where: { id: vetId },
    });

    if (!vet) {
      throw new NotFoundException('Veterinarian not found');
    }

    // Get status breakdown
    const statusBreakdown = await this.getStatusBreakdown(vetId);

    // Get monthly trends (last 6 months)
    const monthlyTrends = await this.getMonthlyTrends(vetId);

    // Get revenue summary
    const revenueSummary = await this.getRevenueSummary(vetId);

    // Get average appointments per period
    const averages = await this.getAverages(vetId);

    return {
      totalAppointments: statusBreakdown.total,
      statusBreakdown: {
        pending: statusBreakdown.pending,
        confirmed: statusBreakdown.confirmed,
        completed: statusBreakdown.completed,
        cancelled: statusBreakdown.cancelled,
      },
      monthlyTrends,
      revenueSummary,
      averages,
    };
  }

  private async getStatusBreakdown(vetId: string) {
    const appointments = await this.prisma.appointment.groupBy({
      by: ['status'],
      where: { veterinarianId: vetId },
      _count: {
        id: true,
      },
    });

    const breakdown = {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    appointments.forEach((group) => {
      const count = group._count.id;
      breakdown.total += count;

      switch (group.status) {
        case AppointmentStatus.PENDING:
          breakdown.pending = count;
          break;
        case AppointmentStatus.CONFIRMED:
          breakdown.confirmed = count;
          break;
        case AppointmentStatus.COMPLETED:
          breakdown.completed = count;
          break;
        case AppointmentStatus.CANCELLED:
          breakdown.cancelled = count;
          break;
      }
    });

    return breakdown;
  }

  private async getMonthlyTrends(vetId: string): Promise<MonthlyStats[]> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        veterinarianId: vetId,
        scheduledAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        scheduledAt: true,
        status: true,
      },
    });

    // Group by month
    const monthlyData = new Map<string, MonthlyStats>();

    appointments.forEach((apt) => {
      const date = new Date(apt.scheduledAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: date.toLocaleString('default', { month: 'long' }),
          year: date.getFullYear(),
          total: 0,
          completed: 0,
          cancelled: 0,
        });
      }

      const stats = monthlyData.get(monthKey)!;
      stats.total += 1;

      if (apt.status === AppointmentStatus.COMPLETED) {
        stats.completed += 1;
      } else if (apt.status === AppointmentStatus.CANCELLED) {
        stats.cancelled += 1;
      }
    });

    return Array.from(monthlyData.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return new Date(`${a.month} 1`).getMonth() - new Date(`${b.month} 1`).getMonth();
    });
  }

  private async getRevenueSummary(vetId: string) {
    const completedAppointments = await this.prisma.appointment.findMany({
      where: {
        veterinarianId: vetId,
        status: AppointmentStatus.COMPLETED,
      },
      include: {
        veterinarian: {
          select: {
            consultationFeeClinic: true,
            consultationFeeHome: true,
            consultationFeeOnline: true,
          },
        },
      },
    });

    let totalRevenue = 0;
    let clinicRevenue = 0;
    let homeRevenue = 0;
    let onlineRevenue = 0;

    completedAppointments.forEach((apt) => {
      const vet = apt.veterinarian;

      // Note: In a real system, the actual fee charged would be in the appointment
      // For now, we'll use the vet's current fees as an estimate
      switch (apt.type) {
        case 'IN_CLINIC':
          clinicRevenue += Number(vet.consultationFeeClinic) || 0;
          break;
        case 'HOME_VISIT':
          homeRevenue += Number(vet.consultationFeeHome) || 0;
          break;
        case 'TELEMEDICINE':
          onlineRevenue += Number(vet.consultationFeeOnline) || 0;
          break;
      }
    });

    totalRevenue = clinicRevenue + homeRevenue + onlineRevenue;

    return {
      total: totalRevenue,
      byType: {
        clinic: clinicRevenue,
        home: homeRevenue,
        online: onlineRevenue,
      },
    };
  }

  private async getAverages(vetId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAppointments = await this.prisma.appointment.count({
      where: {
        veterinarianId: vetId,
        scheduledAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    return {
      perDay: Math.round((recentAppointments / 30) * 10) / 10,
      perWeek: Math.round((recentAppointments / 4.3) * 10) / 10,
      perMonth: recentAppointments,
    };
  }
}
