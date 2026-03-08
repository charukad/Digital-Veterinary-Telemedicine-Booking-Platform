import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLabResultDto, UpdateLabResultDto } from './dto/lab-result.dto';

@Injectable()
export class LabResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createDto: CreateLabResultDto) {
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
        'You can only create lab results for your own medical records',
      );
    }

    return this.prisma.labResult.create({
      data: {
        medicalRecordId: createDto.medicalRecordId,
        testName: createDto.testName,
        testType: createDto.testType,
        results: createDto.results,
        fileUrl: createDto.fileUrl,
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
      throw new ForbiddenException('You do not have access to these lab results');
    }

    return this.prisma.labResult.findMany({
      where: { medicalRecordId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const labResult = await this.prisma.labResult.findUnique({
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

    if (!labResult) {
      throw new NotFoundException('Lab result not found');
    }

    // Check authorization
    const isVet = labResult.medicalRecord.veterinarianId === userId;
    const isOwner = labResult.medicalRecord.pet.ownerId === userId;

    if (!isVet && !isOwner) {
      throw new ForbiddenException('You do not have access to this lab result');
    }

    return labResult;
  }

  async update(id: string, userId: string, updateDto: UpdateLabResultDto) {
    const labResult = await this.prisma.labResult.findUnique({
      where: { id },
      include: {
        medicalRecord: {
          include: {
            veterinarian: true,
          },
        },
      },
    });

    if (!labResult) {
      throw new NotFoundException('Lab result not found');
    }

    // Only the vet who created the medical record can update the lab result
    if (labResult.medicalRecord.veterinarianId !== userId) {
      throw new ForbiddenException(
        'You can only update lab results for your own medical records',
      );
    }

    return this.prisma.labResult.update({
      where: { id },
      data: {
        testName: updateDto.testName,
        testType: updateDto.testType,
        results: updateDto.results,
        fileUrl: updateDto.fileUrl,
        notes: updateDto.notes,
      },
    });
  }

  async delete(id: string, userId: string) {
    const labResult = await this.prisma.labResult.findUnique({
      where: { id },
      include: {
        medicalRecord: {
          include: {
            veterinarian: true,
          },
        },
      },
    });

    if (!labResult) {
      throw new NotFoundException('Lab result not found');
    }

    // Only the vet who created the medical record can delete the lab result
    if (labResult.medicalRecord.veterinarianId !== userId) {
      throw new ForbiddenException(
        'You can only delete lab results for your own medical records',
      );
    }

    await this.prisma.labResult.delete({
      where: { id },
    });

    return { message: 'Lab result deleted successfully' };
  }
}
