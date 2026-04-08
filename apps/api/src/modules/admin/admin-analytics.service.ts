import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminAnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats() {
    const [
      totalUsers,
      totalPetOwners,
      totalVeterinarians,
      totalPets,
      totalAppointments,
      completedAppointments,
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue,
      totalReviews,
      averageRating,
      activeUsers,
      pendingVets,
    ] = await Promise.all([
      // Total users
      this.prisma.user.count(),

      // Pet owners
      this.prisma.petOwner.count(),

      // Veterinarians
      this.prisma.veterinarian.count(),

      // Total pets
      this.prisma.pet.count(),

      // Total appointments
      this.prisma.appointment.count(),

      // Completed appointments
      this.prisma.appointment.count({
        where: { status: 'COMPLETED' },
      }),

      // Total revenue
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),

      // Monthly revenue (last 30 days)
      this.prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        _sum: { amount: true },
      }),

      // Weekly revenue (last 7 days)
      this.prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        _sum: { amount: true },
      }),

      // Total reviews
      this.prisma.review.count(),

      // Average rating
      this.prisma.review.aggregate({
        _avg: { rating: true },
      }),

      // Active users (logged in last 7 days)
      this.prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Pending vet verifications
      this.prisma.veterinarian.count({
        where: { verified: false },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        petOwners: totalPetOwners,
        veterinarians: totalVeterinarians,
        active: activeUsers,
      },
      pets: {
        total: totalPets,
        averagePerOwner: totalPetOwners > 0 ? (totalPets / totalPetOwners).toFixed(2) : 0,
      },
      appointments: {
        total: totalAppointments,
        completed: completedAppointments,
        completionRate: totalAppointments > 0
          ? ((completedAppointments / totalAppointments) * 100).toFixed(1)
          : 0,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
        monthly: monthlyRevenue._sum.amount || 0,
        weekly: weeklyRevenue._sum.amount || 0,
      },
      reviews: {
        total: totalReviews,
        averageRating: averageRating._avg.rating
          ? parseFloat(averageRating._avg.rating.toFixed(2))
          : 0,
      },
      pending: {
        veterinarians: pendingVets,
      },
    };
  }

  /**
   * Get user growth statistics (last 12 months)
   */
  async getUserGrowth() {
    const months: { month: string; count: number }[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const count = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      months.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count,
      });
    }

    return months;
  }

  /**
   * Get revenue analytics (last 12 months)
   */
  async getRevenueAnalytics() {
    const months: { month: string; revenue: any; transactions: number }[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const result = await this.prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: { amount: true },
        _count: true,
      });

      months.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: result._sum.amount || 0,
        transactions: result._count,
      });
    }

    return months;
  }

  /**
   * Get appointment analytics
   */
  async getAppointmentAnalytics() {
    const [byStatus, byType, recent] = await Promise.all([
      // By status
      this.prisma.appointment.groupBy({
        by: ['status'],
        _count: true,
      }),

      // By type
      this.prisma.appointment.groupBy({
        by: ['type'],
        _count: true,
      }),

      // Recent appointments (last 30 days)
      this.prisma.appointment.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count,
      })),
      byType: byType.map(item => ({
        type: item.type,
        count: item._count,
      })),
      recentCount: recent,
    };
  }

  /**
   * Get top veterinarians by appointments
   */
  async getTopVeterinarians(limit: number = 10) {
    const vets = await this.prisma.veterinarian.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        specializations: true,
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: {
        appointments: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return vets.map(vet => ({
      id: vet.id,
      name: `Dr. ${vet.user.firstName} ${vet.user.lastName}`,
      email: vet.user.email,
      specialization: vet.specializations?.map(s => s.specialization).join(', ') || '',
      appointmentCount: vet._count.appointments,
      rating: vet.rating ? vet.rating.toNumber() : 0,
    }));
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth() {
    const [
      dbSize,
      totalRecords,
      oldestAppointment,
      newestAppointment,
    ] = await Promise.all([
      // Database record counts as proxy for size
      this.prisma.user.count(),

      // Total records across main tables
      Promise.all([
        this.prisma.user.count(),
        this.prisma.pet.count(),
        this.prisma.appointment.count(),
        this.prisma.payment.count(),
      ]).then(counts => counts.reduce((a, b) => a + b, 0)),

      // Oldest appointment
      this.prisma.appointment.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),

      // Newest appointment
      this.prisma.appointment.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    return {
      totalRecords,
      oldestRecord: oldestAppointment?.createdAt,
      newestRecord: newestAppointment?.createdAt,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };
  }
}
