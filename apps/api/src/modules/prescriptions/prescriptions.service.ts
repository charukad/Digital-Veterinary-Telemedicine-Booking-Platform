import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from './dto/prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createDto: CreatePrescriptionDto) {
    // Verify medical record exists and belongs to the vet
    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: { id: createDto.medicalRecordId },
      include: {
        veterinarian: true,
      },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Medical record not found');
    }

    if (medicalRecord.veterinarianId !== userId) {
      throw new ForbiddenException(
        'You can only create prescriptions for your own medical records',
      );
    }

    return this.prisma.prescription.create({
      data: {
        medicalRecordId: createDto.medicalRecordId,
        medicationName: createDto.medicationName,
        dosage: createDto.dosage,
        frequency: createDto.frequency,
        duration: createDto.duration,
        instructions: createDto.instructions,
        notes: createDto.notes,
      },
      include: {
        medicalRecord: {
          include: {
            pet: {
              select: {
                id: true,
                name: true,
              },
            },
            veterinarian: {
              select: {
                id: true,
                userId: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAllByMedicalRecord(medicalRecordId: string, userId: string) {
    // Verify user has access to this medical record
    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: { id: medicalRecordId },
      include: {
        pet: {
          include: {
            owner: true,
          },
        },
        veterinarian: true,
      },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Medical record not found');
    }

    // Check if user is the vet or the pet owner
    const isVet = medicalRecord.veterinarianId === userId;
    const isOwner = medicalRecord.pet.ownerId === userId;

    if (!isVet && !isOwner) {
      throw new ForbiddenException('You do not have access to these prescriptions');
    }

    return this.prisma.prescription.findMany({
      where: { medicalRecordId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        medicalRecord: {
          include: {
            pet: {
              include: {
                owner: true,
              },
            },
            veterinarian: true,
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    // Check authorization
    const isVet = prescription.medicalRecord.veterinarianId === userId;
    const isOwner = prescription.medicalRecord.pet.ownerId === userId;

    if (!isVet && !isOwner) {
      throw new ForbiddenException('You do not have access to this prescription');
    }

    return prescription;
  }

  async update(id: string, userId: string, updateDto: UpdatePrescriptionDto) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        medicalRecord: {
          include: {
            veterinarian: true,
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    // Only the vet who created the medical record can update the prescription
    if (prescription.medicalRecord.veterinarianId !== userId) {
      throw new ForbiddenException(
        'You can only update prescriptions for your own medical records',
      );
    }

    return this.prisma.prescription.update({
      where: { id },
      data: {
        medicationName: updateDto.medicationName,
        dosage: updateDto.dosage,
        frequency: updateDto.frequency,
        duration: updateDto.duration,
        instructions: updateDto.instructions,
        notes: updateDto.notes,
      },
    });
  }

  async delete(id: string, userId: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        medicalRecord: {
          include: {
            veterinarian: true,
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    // Only the vet who created the medical record can delete the prescription
    if (prescription.medicalRecord.veterinarianId !== userId) {
      throw new ForbiddenException(
        'You can only delete prescriptions for your own medical records',
      );
    }

    await this.prisma.prescription.delete({
      where: { id },
    });

    return { message: 'Prescription deleted successfully' };
  }
}
