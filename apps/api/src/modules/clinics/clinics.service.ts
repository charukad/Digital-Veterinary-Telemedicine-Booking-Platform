import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClinicDto, UpdateClinicDto } from './dto/clinic.dto';

@Injectable()
export class ClinicsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateClinicDto) {
    // Verify user is a veterinarian
    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
    });

    if (!vet) {
      throw new ForbiddenException('Only veterinarians can create clinics');
    }

    // Clinic model has no ownerId, description - associate via ClinicVeterinarian
    const clinic = await this.prisma.clinic.create({
      data: {
        name: (createDto as any).name,
        registrationNumber: (createDto as any).registrationNumber,
        address: (createDto as any).address,
        city: (createDto as any).city,
        latitude: (createDto as any).latitude ? parseFloat((createDto as any).latitude) : null,
        longitude: (createDto as any).longitude ? parseFloat((createDto as any).longitude) : null,
        phone: (createDto as any).phone,
        email: (createDto as any).email,
        operatingHours: (createDto as any).operatingHours || {},
        facilities: (createDto as any).facilities || [],
      },
    });

    // Associate vet with clinic
    await this.prisma.clinicVeterinarian.create({
      data: {
        clinicId: clinic.id,
        veterinarianId: vet.id,
        isPrimary: true,
      },
    });

    return clinic;
  }

  async findAll(city?: string, search?: string) {
    const where: any = {};

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.clinic.findMany({
      where,
      include: {
        veterinarians: {
          select: {
            id: true,
            isPrimary: true,
            veterinarianId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
      include: {
        veterinarians: {
          select: {
            id: true,
            isPrimary: true,
            veterinarianId: true,
          },
        },
      },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    return clinic;
  }

  async update(id: string, userId: string, updateDto: UpdateClinicDto) {
    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
    });

    if (!vet) {
      throw new ForbiddenException('Only veterinarians can update clinics');
    }

    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    // Verify vet is associated with this clinic
    const assoc = await this.prisma.clinicVeterinarian.findFirst({
      where: { clinicId: id, veterinarianId: vet.id },
    });

    if (!assoc) {
      throw new ForbiddenException('You can only update clinics you are associated with');
    }

    return this.prisma.clinic.update({
      where: { id },
      data: {
        name: (updateDto as any).name,
        registrationNumber: (updateDto as any).registrationNumber,
        address: (updateDto as any).address,
        city: (updateDto as any).city,
        latitude: (updateDto as any).latitude ? parseFloat((updateDto as any).latitude) : undefined,
        longitude: (updateDto as any).longitude ? parseFloat((updateDto as any).longitude) : undefined,
        phone: (updateDto as any).phone,
        email: (updateDto as any).email,
        operatingHours: (updateDto as any).operatingHours,
        facilities: (updateDto as any).facilities,
      },
    });
  }

  async remove(id: string, userId: string) {
    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
    });

    if (!vet) {
      throw new ForbiddenException('Only veterinarians can delete clinics');
    }

    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    const assoc = await this.prisma.clinicVeterinarian.findFirst({
      where: { clinicId: id, veterinarianId: vet.id, isPrimary: true },
    });

    if (!assoc) {
      throw new ForbiddenException('You can only delete clinics you own');
    }

    await this.prisma.clinic.delete({
      where: { id },
    });

    return { message: 'Clinic deleted successfully' };
  }

  async getMyClinics(userId: string) {
    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
    });

    if (!vet) {
      return [];
    }

    const assocs = await this.prisma.clinicVeterinarian.findMany({
      where: { veterinarianId: vet.id },
      include: { clinic: true },
    });

    return assocs.map((a) => a.clinic);
  }
}
