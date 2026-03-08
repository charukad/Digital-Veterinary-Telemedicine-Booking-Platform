import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto/medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateMedicalRecordDto) {
    // Verify the veterinarian
    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
    });

    if (!vet) {
      throw new ForbiddenException('Only veterinarians can create medical records');
    }

    // Verify the appointment belongs to this vet
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: createDto.appointmentId },
    });

    if (!appointment || appointment.veterinarianId !== vet.id) {
      throw new ForbiddenException('You can only create records for your appointments');
    }

    // Create the medical record
    const record = await this.prisma.medicalRecord.create({
      data: {
        petId: createDto.petId,
        veterinarianId: vet.id,
        appointmentId: createDto.appointmentId,
        diagnosis: createDto.diagnosis,
        treatment: createDto.treatment,
        prescription: createDto.prescription,
        notes: createDto.notes,
        attachments: createDto.attachments || [],
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
          },
        },
        veterinarian: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return record;
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
      whereClause.petId = { in: petIds };
    } else if (role === 'VETERINARIAN') {
      const vet = await this.prisma.veterinarian.findUnique({
        where: { userId },
      });

      if (!vet) {
        return [];
      }

      whereClause.veterinarianId = vet.id;
    }

    return this.prisma.medicalRecord.findMany({
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
        veterinarian: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        appointment: {
          select: {
            id: true,
            scheduledAt: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            dateOfBirth: true,
            owner: {
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
        },
        veterinarian: {
          select: {
            id: true,
            licenseNumber: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        appointment: {
          select: {
            id: true,
            scheduledAt: true,
            type: true,
            status: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    // Authorization check
    if (role === 'PET_OWNER') {
      const petOwner = await this.prisma.petOwner.findUnique({
        where: { userId },
        include: { pets: { select: { id: true } } },
      });

      const petIds = petOwner?.pets.map((pet) => pet.id) || [];
      if (!petIds.includes(record.petId)) {
        throw new ForbiddenException('You can only view records for your pets');
      }
    } else if (role === 'VETERINARIAN') {
      const vet = await this.prisma.veterinarian.findUnique({
        where: { userId },
      });

      if (record.veterinarianId !== vet?.id) {
        throw new ForbiddenException('You can only view your own records');
      }
    }

    return record;
  }

  async update(id: string, userId: string, updateDto: UpdateMedicalRecordDto) {
    // Verify the veterinarian
    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
    });

    if (!vet) {
      throw new ForbiddenException('Only veterinarians can update medical records');
    }

    // Verify ownership
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    if (record.veterinarianId !== vet.id) {
      throw new ForbiddenException('You can only update your own records');
    }

    // Update the record
    return this.prisma.medicalRecord.update({
      where: { id },
      data: {
        diagnosis: updateDto.diagnosis,
        treatment: updateDto.treatment,
        prescription: updateDto.prescription,
        notes: updateDto.notes,
        attachments: updateDto.attachments,
        updatedAt: new Date(),
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
          },
        },
        veterinarian: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    // Verify the veterinarian
    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
    });

    if (!vet) {
      throw new ForbiddenException('Only veterinarians can delete medical records');
    }

    // Verify ownership
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    if (record.veterinarianId !== vet.id) {
      throw new ForbiddenException('You can only delete your own records');
    }

    // Delete the record
    await this.prisma.medicalRecord.delete({
      where: { id },
    });

    return { message: 'Medical record deleted successfully' };
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
        throw new ForbiddenException('You can only view records for your pets');
      }
    }

    return this.prisma.medicalRecord.findMany({
      where: { petId },
      include: {
        veterinarian: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        appointment: {
          select: {
            id: true,
            scheduledAt: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
