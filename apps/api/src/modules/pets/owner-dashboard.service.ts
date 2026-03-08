import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OwnerDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    // Get pet owner
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
      include: { pets: { select: { id: true } } },
    });

    if (!petOwner) {
      throw new Error('Pet owner not found');
    }

    const petIds = petOwner.pets.map((pet) => pet.id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Get upcoming appointments
    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        ownerId: petOwner.id,
        scheduledAt: { gte: today },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      include: {
        pet: { select: { name: true, species: true } },
        veterinarian: {
          select: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    });

    // Get statistics
    const [totalAppointments, completedAppointments, totalPets] =
      await Promise.all([
        this.prisma.appointment.count({
          where: { ownerId: petOwner.id },
        }),
        this.prisma.appointment.count({
          where: {
            ownerId: petOwner.id,
            status: 'COMPLETED',
          },
        }),
        this.prisma.pet.count({
          where: { ownerId: petOwner.id },
        }),
      ]);

    // Get pets with recent medical records
    const petsWithRecords = await this.prisma.pet.findMany({
      where: { ownerId: petOwner.id },
      select: {
        id: true,
        name: true,
        species: true,
        breed: true,
        profileImage: true,
        medicalRecords: {
          select: {
            id: true,
            diagnosis: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Get upcoming vaccinations
    const upcomingVaccinations = await this.prisma.vaccination.findMany({
      where: {
        petId: { in: petIds },
        nextDueDate: {
          gte: today,
          lt: nextWeek,
        },
      },
      select: {
        id: true,
        vaccineName: true,
        nextDueDate: true,
        pet: { select: { name: true, species: true } },
      },
      orderBy: { nextDueDate: 'asc' },
    });

    return {
      upcomingAppointments: upcomingAppointments.map((apt) => ({
        id: apt.id,
        time: apt.scheduledAt,
        type: apt.type,
        status: apt.status,
        pet: apt.pet.name,
        species: apt.pet.species,
        vet: `Dr. ${apt.veterinarian.user.firstName} ${apt.veterinarian.user.lastName}`,
      })),
      statistics: {
        totalAppointments,
        completedAppointments,
        totalPets,
      },
      pets: petsWithRecords,
      upcomingVaccinations,
    };
  }
}
