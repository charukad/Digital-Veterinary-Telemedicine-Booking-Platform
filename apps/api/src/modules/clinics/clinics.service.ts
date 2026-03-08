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

    return this.prisma.clinic.create({
      data: {
        name: createDto.name,
        registrationNumber: createDto.registrationNumber,
        address: createDto.address,
        latitude: createDto.latitude ? parseFloat(createDto.latitude) : null,
        longitude: createDto.longitude ? parseFloat(createDto.longitude) : null,
        phone: createDto.phone,
        email: createDto.email,
        operatingHours: createDto.operatingHours || {},
        description: createDto.description,
        ownerId: vet.id,
      },
    });
  }

  async findAll(city?: string, search?: string) {
    const where: any = {};

    if (city) {
      where.address = { contains: city, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.clinic.findMany({
      where,
      include: {
        owner: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
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
        owner: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            specializations: true,
            licenseNumber: true,
          },
        },
        veterinarians: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            specializations: true,
            consultationFee: true,
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

    if (clinic.ownerId !== vet.id) {
      throw new ForbiddenException('You can only update your own clinics');
    }

    return this.prisma.clinic.update({
      where: { id },
      data: {
        name: updateDto.name,
        registrationNumber: updateDto.registrationNumber,
        address: updateDto.address,
        latitude: updateDto.latitude ? parseFloat(updateDto.latitude) : undefined,
        longitude: updateDto.longitude ? parseFloat(updateDto.longitude) : undefined,
        phone: updateDto.phone,
        email: updateDto.email,
        operatingHours: updateDto.operatingHours,
        description: updateDto.description,
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

    if (clinic.ownerId !== vet.id) {
      throw new ForbiddenException('You can only delete your own clinics');
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

    return this.prisma.clinic.findMany({
      where: { ownerId: vet.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
