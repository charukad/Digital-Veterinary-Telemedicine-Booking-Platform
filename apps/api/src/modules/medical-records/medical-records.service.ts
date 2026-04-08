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

    // Create the health record (the current schema)
    const record = await this.prisma.healthRecord.create({
      data: {
        petId: createDto.petId,
        vetId: vet.id,
        recordType: 'checkup',
        title: createDto.diagnosis || 'Health Record',
        description: `Diagnosis: ${createDto.diagnosis || ''}\nTreatment: ${createDto.treatment || ''}\n${createDto.notes || ''}`.trim(),
        recordDate: new Date(),
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

      whereClause.vetId = vet.id;
    }

    return this.prisma.healthRecord.findMany({
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const record = await this.prisma.healthRecord.findUnique({
      where: { id },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            dateOfBirth: true,
            ownerId: true,
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

      if (record.vetId !== vet?.id) {
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
    const record = await this.prisma.healthRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    if (record.vetId !== vet.id) {
      throw new ForbiddenException('You can only update your own records');
    }

    return this.prisma.healthRecord.update({
      where: { id },
      data: {
        title: updateDto.diagnosis || undefined,
        description: `${updateDto.diagnosis ? 'Diagnosis: ' + updateDto.diagnosis : ''}\n${updateDto.treatment ? 'Treatment: ' + updateDto.treatment : ''}\n${updateDto.notes || ''}`.trim() || undefined,
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

    const record = await this.prisma.healthRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    if (record.vetId !== vet.id) {
      throw new ForbiddenException('You can only delete your own records');
    }

    await this.prisma.healthRecord.delete({
      where: { id },
    });

    return { message: 'Medical record deleted successfully' };
  }

  async findByPet(petId: string, userId: string, role: string) {
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

    return this.prisma.healthRecord.findMany({
      where: { petId },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
