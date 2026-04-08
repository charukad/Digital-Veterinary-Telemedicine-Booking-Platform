import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateVetProfileDto } from './dto/veterinarian.dto';
import { CreateAvailabilitySlotDto, UpdateAvailabilitySlotDto } from './dto/availability.dto';

@Injectable()
export class VeterinariansService {
  constructor(private prisma: PrismaService) { }

  async getProfile(userId: string) {
    const veterinarian = await this.prisma.veterinarian.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            status: true,
            firstName: true,
            lastName: true,
          },
        },
        qualifications: true,
        specializations: true,
        clinicAffiliations: {
          include: {
            clinic: true,
          },
        },
        availabilitySlots: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!veterinarian) {
      throw new NotFoundException('Veterinarian profile not found');
    }

    return veterinarian;
  }

  async updateProfile(userId: string, updateDto: UpdateVetProfileDto) {
    // Check if vet exists
    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
    });

    if (!vet) {
      throw new NotFoundException('Veterinarian profile not found');
    }

    // Separate nested objects from flat fields
    const { qualifications, specializations, ...flatFields } = updateDto;

    // Update basic profile
    await this.prisma.veterinarian.update({
      where: { userId },
      data: flatFields,
    });

    // Handle qualifications - map DTO fields to Prisma schema fields
    if (qualifications) {
      // Delete existing qualifications
      await this.prisma.vetQualification.deleteMany({
        where: { veterinarianId: vet.id },
      });

      // Create new qualifications
      if (qualifications.length > 0) {
        await this.prisma.vetQualification.createMany({
          data: qualifications.map((qual) => ({
            degree: qual.degree,
            institution: qual.institution,
            yearObtained: parseInt(qual.year, 10), // Convert to integer
            certificateUrl: qual.certificateUrl,
            veterinarianId: vet.id,
          })),
        });
      }

    }

    // Handle specializations - map DTO fields to Prisma schema fields
    if (specializations) {
      // Delete existing specializations
      await this.prisma.vetSpecialization.deleteMany({
        where: { veterinarianId: vet.id },
      });

      // Create new specializations
      if (specializations.length > 0) {
        await this.prisma.vetSpecialization.createMany({
          data: specializations.map((spec) => ({
            specialization: spec.name, // Map 'name' to 'specialization'
            certificateUrl: spec.certificateUrl,
            veterinarianId: vet.id,
          })),
        });
      }
    }

    // Return updated profile with relations
    return this.getProfile(vet.userId);
  }

  async searchVeterinarians(filters: {
    query?: string;
    city?: string;
    specialization?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sort?: string;
  }) {
    const where: any = {
      verified: true,
    };

    if (filters.query) {
      where.OR = [
        { firstName: { contains: filters.query, mode: 'insensitive' } },
        { lastName: { contains: filters.query, mode: 'insensitive' } },
        { bio: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    if (filters.city) {
      where.clinicAffiliations = {
        some: {
          clinic: {
            city: { contains: filters.city, mode: 'insensitive' },
          },
        },
      };
    }

    if (filters.specialization) {
      where.specializations = {
        some: {
          name: { contains: filters.specialization, mode: 'insensitive' },
        },
      };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.consultationFeeClinic = {};
      if (filters.minPrice !== undefined) {
        where.consultationFeeClinic.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.consultationFeeClinic.lte = filters.maxPrice;
      }
    }

    if (filters.minRating !== undefined) {
      where.rating = { gte: filters.minRating };
    }

    let orderBy: any = { createdAt: 'desc' };

    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          orderBy = { consultationFeeClinic: 'asc' };
          break;
        case 'price_desc':
          orderBy = { consultationFeeClinic: 'desc' };
          break;
        case 'rating':
          orderBy = { rating: 'desc' };
          break;
        case 'experience':
          orderBy = { yearsOfExperience: 'desc' };
          break;
      }
    }

    return this.prisma.veterinarian.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
          },
        },
        specializations: true,
        clinicAffiliations: {
          include: {
            clinic: {
              select: {
                name: true,
                address: true,
                city: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }

  async getAllVeterinarians(filters?: {
    city?: string;
    specialization?: string;
    availability?: string;
  }) {
    const where: any = {};

    if (filters?.city) {
      where.clinicAffiliations = {
        some: {
          clinic: {
            city: filters.city,
          },
        },
      };
    }

    if (filters?.specialization) {
      where.specializations = {
        some: {
          name: {
            contains: filters.specialization,
            mode: 'insensitive',
          },
        },
      };
    }

    const veterinarians = await this.prisma.veterinarian.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            status: true,
            firstName: true,
            lastName: true,
          },
        },
        specializations: true,
        clinicAffiliations: {
          include: {
            clinic: {
              select: {
                name: true,
                city: true,
                address: true,
              },
            },
          },
        },
      },
      orderBy: {
        yearsOfExperience: 'desc',
      },
    });

    return veterinarians;
  }

  async getVeterinarianById(id: string) {
    const veterinarian = await this.prisma.veterinarian.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
          },
        },
        qualifications: true,
        specializations: true,
        clinicAffiliations: {
          include: {
            clinic: true,
          },
        },
        availabilitySlots: {
          orderBy: { dayOfWeek: 'asc' },
        },
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!veterinarian) {
      throw new NotFoundException('Veterinarian not found');
    }

    return veterinarian;
  }

  // Availability Management
  async getAvailability(userId: string) {
    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
      include: {
        availabilitySlots: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
    });

    if (!vet) {
      throw new NotFoundException('Veterinarian profile not found');
    }

    return vet.availabilitySlots;
  }

  async setAvailability(userId: string, slots: CreateAvailabilitySlotDto[]) {
    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
    });

    if (!vet) {
      throw new NotFoundException('Veterinarian profile not found');
    }

    // Validate time slots
    for (const slot of slots) {
      if (slot.startTime >= slot.endTime) {
        throw new BadRequestException('Start time must be before end time');
      }
    }

    // Delete existing slots
    await this.prisma.availabilitySlot.deleteMany({
      where: { veterinarianId: vet.id },
    });

    // Create new slots
    if (slots.length > 0) {
      await this.prisma.availabilitySlot.createMany({
        data: slots.map((slot) => ({
          ...slot,
          veterinarianId: vet.id,
          isAvailable: slot.isAvailable !== false,
        })),
      });
    }

    return this.getAvailability(userId);
  }

  async updateSlot(userId: string, slotId: string, data: UpdateAvailabilitySlotDto) {
    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
    });

    if (!vet) {
      throw new NotFoundException('Veterinarian profile not found');
    }

    const slot = await this.prisma.availabilitySlot.findFirst({
      where: { id: slotId, veterinarianId: vet.id },
    });

    if (!slot) {
      throw new NotFoundException('Availability slot not found');
    }

    return this.prisma.availabilitySlot.update({
      where: { id: slotId },
      data,
    });
  }

  async deleteSlot(userId: string, slotId: string) {
    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
    });

    if (!vet) {
      throw new NotFoundException('Veterinarian profile not found');
    }

    const slot = await this.prisma.availabilitySlot.findFirst({
      where: { id: slotId, veterinarianId: vet.id },
    });

    if (!slot) {
      throw new NotFoundException('Availability slot not found');
    }

    return this.prisma.availabilitySlot.delete({
      where: { id: slotId },
    });
  }

  async getAvailableSlots(vetId: string, date: string) {
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    const slots = await this.prisma.availabilitySlot.findMany({
      where: {
        veterinarianId: vetId,
        dayOfWeek,
        isAvailable: true,
      },
      orderBy: { startTime: 'asc' },
    });

    return slots;
  }
}
