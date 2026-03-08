import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VetDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    // Get veterinarian
    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
    });

    if (!vet) {
      throw new Error('Veterinarian not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's appointments
    const todaysAppointments = await this.prisma.appointment.findMany({
      where: {
        veterinarianId: vet.id,
        scheduledAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
        petOwner: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    // Get upcoming appointments (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        veterinarianId: vet.id,
        scheduledAt: {
          gte: tomorrow,
          lt: nextWeek,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      select: {
        id: true,
        scheduledAt: true,
        type: true,
        status: true,
        pet: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    });

    // Get statistics
    const [totalAppointments, completedAppointments, pendingAppointments] =
      await Promise.all([
        this.prisma.appointment.count({
          where: { veterinarianId: vet.id },
        }),
        this.prisma.appointment.count({
          where: {
            veterinarianId: vet.id,
            status: 'COMPLETED',
          },
        }),
        this.prisma.appointment.count({
          where: {
            veterinarianId: vet.id,
            status: 'PENDING',
          },
        }),
      ]);

    // Get recent medical records
    const recentRecords = await this.prisma.medicalRecord.findMany({
      where: { veterinarianId: vet.id },
      select: {
        id: true,
        diagnosis: true,
        createdAt: true,
        pet: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get upcoming vaccinations
    const upcomingVaccinations = await this.prisma.vaccination.findMany({
      where: {
        veterinarianId: vet.id,
        nextDueDate: {
          gte: today,
          lt: nextWeek,
        },
      },
      select: {
        id: true,
        vaccineName: true,
        nextDueDate: true,
        pet: {
          select: {
            name: true,
            owner: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { nextDueDate: 'asc' },
      take: 5,
    });

    return {
      todaysAppointments: {
        count: todaysAppointments.length,
        appointments: todaysAppointments.map((apt) => ({
          id: apt.id,
          time: apt.scheduledAt,
          type: apt.type,
          status: apt.status,
          pet: apt.pet.name,
          species: apt.pet.species,
          owner: `${apt.petOwner.user.firstName} ${apt.petOwner.user.lastName}`,
          phone: apt.petOwner.user.phone,
        })),
      },
      upcomingAppointments,
      statistics: {
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        averageRating: vet.averageRating,
        reviewCount: vet.reviewCount,
      },
      recentRecords,
      upcomingVaccinations: upcomingVaccinations.map((vac) => ({
        id: vac.id,
        vaccineName: vac.vaccineName,
        dueDate: vac.nextDueDate,
        petName: vac.pet.name,
        ownerName: `${vac.pet.owner.user.firstName} ${vac.pet.owner.user.lastName}`,
        ownerPhone: vac.pet.owner.user.phone,
      })),
    };
  }

  async getTodaysSchedule(userId: string) {
    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
    });

    if (!vet) {
      throw new Error('Veterinarian not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.appointment.findMany({
      where: {
        veterinarianId: vet.id,
        scheduledAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            dateOfBirth: true,
          },
        },
        petOwner: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}
