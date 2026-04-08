import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVaccinationDto, UpdateVaccinationDto } from './dto/vaccination.dto';

@Injectable()
export class VaccinationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateVaccinationDto) {
    // Verify the veterinarian
    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
    });

    if (!vet) {
      throw new ForbiddenException('Only veterinarians can create vaccination records');
    }

    // Verify pet exists
    const pet = await this.prisma.pet.findUnique({
      where: { id: createDto.petId },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    // Create vaccination record
    const vaccination = await this.prisma.vaccination.create({
      data: {
        petId: createDto.petId,
        vetId: vet.id,
        vaccineName: createDto.vaccineName,
        administeredDate: new Date((createDto as any).dateAdministered || new Date()),
        nextDueDate: createDto.nextDueDate ? new Date(createDto.nextDueDate) : null,
        batchNumber: createDto.batchNumber,
        // manufacturer: (createDto as any).manufacturer,
        // notes: createDto.notes,
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
        // veterinarian removed
      },
    });

    return vaccination;
  }

  async findAll(userId: string, role: string, petId?: string) {
    const whereClause: any = {};

    if (petId) {
      whereClause.petId = petId;
    }

    // Role-based filtering
    if (role === 'PET_OWNER') {
      const petOwner = await this.prisma.petOwner.findUnique({
        where: { userId },
        include: { pets: { select: { id: true } } },
      });

      if (!petOwner) {
        return [];
      }

      const petIds = petOwner.pets.map((pet) => pet.id);

      if (petId) {
        // Check if the requested petId belongs to the owner
        if (!petIds.includes(petId)) {
          throw new ForbiddenException('You can only view vaccinations for your pets');
        }
      } else {
        whereClause.petId = { in: petIds };
      }
    } else if (role === 'VETERINARIAN') {
      const vet = await this.prisma.veterinarian.findUnique({
        where: { userId },
      });

      if (!vet) {
        return [];
      }

      whereClause.veterinarianId = vet.id;
    }

    return this.prisma.vaccination.findMany({
      where: whereClause,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
          },
        },
        // veterinarian removed
      },
      orderBy: { administeredDate: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const vaccination = await this.prisma.vaccination.findUnique({
      where: { id },
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
        // veterinarian removed
      },
    });

    if (!vaccination) {
      throw new NotFoundException('Vaccination record not found');
    }

    // Authorization check
    if (role === 'PET_OWNER') {
      const petOwner = await this.prisma.petOwner.findUnique({
        where: { userId },
        include: { pets: { select: { id: true } } },
      });

      const petIds = petOwner?.pets.map((pet) => pet.id) || [];
      if (!petIds.includes(vaccination.petId)) {
        throw new ForbiddenException('You can only view vaccinations for your pets');
      }
    } else if (role === 'VETERINARIAN') {
      const vet = await this.prisma.veterinarian.findUnique({
        where: { userId },
      });

      if (vaccination.vetId !== vet?.id) {
        throw new ForbiddenException('You can only view your own vaccination records');
      }
    }

    return vaccination;
  }

  async update(id: string, userId: string, updateDto: UpdateVaccinationDto) {
    // Verify the veterinarian
    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
    });

    if (!vet) {
      throw new ForbiddenException('Only veterinarians can update vaccination records');
    }

    // Verify ownership
    const vaccination = await this.prisma.vaccination.findUnique({
      where: { id },
    });

    if (!vaccination) {
      throw new NotFoundException('Vaccination record not found');
    }

    if (vaccination.vetId !== vet.id) {
      throw new ForbiddenException('You can only update your own vaccination records');
    }

    // Update the record
    return this.prisma.vaccination.update({
      where: { id },
      data: {
        vaccineName: updateDto.vaccineName,
        administeredDate: (updateDto as any).dateAdministered
          ? new Date((updateDto as any).dateAdministered)
          : undefined,
        nextDueDate: updateDto.nextDueDate ? new Date(updateDto.nextDueDate) : undefined,
        batchNumber: updateDto.batchNumber,
        // manufacturer: (updateDto as any).manufacturer,
        // notes: (updateDto as any).notes,
        updatedAt: new Date(),
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
        // veterinarian removed
      },
    });
  }

  async remove(id: string, userId: string) {
    // Verify the veterinarian
    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
    });

    if (!vet) {
      throw new ForbiddenException('Only veterinarians can delete vaccination records');
    }

    // Verify ownership
    const vaccination = await this.prisma.vaccination.findUnique({
      where: { id },
    });

    if (!vaccination) {
      throw new NotFoundException('Vaccination record not found');
    }

    if (vaccination.vetId !== vet.id) {
      throw new ForbiddenException('You can only delete your own vaccination records');
    }

    // Delete the record
    await this.prisma.vaccination.delete({
      where: { id },
    });

    return { message: 'Vaccination record deleted successfully' };
  }

  async findByPet(petId: string, userId: string, role: string) {
    // Authorization check
    if (role === 'PET_OWNER') {
      const petOwner = await this.prisma.petOwner.findUnique({
        where: { userId },
        include: { pets: { select: { id: true } } },
      });

      const petIds = petOwner?.pets.map((pet) => pet.id) || [];
      if (!petIds.includes(petId)) {
        throw new ForbiddenException('You can only view vaccinations for your pets');
      }
    }

    return this.prisma.vaccination.findMany({
      where: { petId },
      include: {
        // veterinarian removed
      },
      orderBy: { administeredDate: 'desc' },
    });
  }

  async getUpcoming(userId: string, role: string, days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const whereClause: any = {
      nextDueDate: {
        gte: new Date(),
        lte: futureDate,
      },
    };

    // Role-based filtering
    if (role === 'PET_OWNER') {
      const petOwner = await this.prisma.petOwner.findUnique({
        where: { userId },
        include: { pets: { select: { id: true } } },
      });

      if (!petOwner) {
        return [];
      }

      const petIds = petOwner.pets.map((pet) => pet.id);
      whereClause.petId = { in: petIds };
    } else if (role === 'VETERINARIAN') {
      const vet = await this.prisma.veterinarian.findUnique({
        where: { userId },
      });

      if (!vet) {
        return [];
      }

      whereClause.vetId = vet.id;
    }

    return this.prisma.vaccination.findMany({
      where: whereClause,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            owner: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { nextDueDate: 'asc' },
    });
  }
}
