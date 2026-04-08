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
    // Find a consultation linked to the provided id (medicalRecordId used as consultationId)
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: createDto.medicalRecordId },
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    // Build medications array from individual fields
    const medications = [
      {
        name: createDto.medicationName,
        dosage: createDto.dosage,
        frequency: createDto.frequency,
        duration: createDto.duration,
        notes: createDto.notes,
      },
    ];

    return this.prisma.prescription.create({
      data: {
        consultationId: createDto.medicalRecordId,
        medications,
        instructions: createDto.instructions,
      },
      include: {
        consultation: {
          select: {
            id: true,
            diagnosis: true,
          },
        },
      },
    });
  }

  async findAllByConsultation(consultationId: string, userId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    return this.prisma.prescription.findMany({
      where: { consultationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Alias for backwards compatibility
  async findAllByMedicalRecord(medicalRecordId: string, userId: string) {
    return this.findAllByConsultation(medicalRecordId, userId);
  }

  async findOne(id: string, userId: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        consultation: {
          select: {
            id: true,
            diagnosis: true,
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return prescription;
  }

  async update(id: string, userId: string, updateDto: UpdatePrescriptionDto) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    const dto = updateDto as any;
    const updateData: any = {};

    if (dto.medicationName || dto.dosage || dto.frequency || dto.duration) {
      updateData.medications = [
        {
          name: dto.medicationName,
          dosage: dto.dosage,
          frequency: dto.frequency,
          duration: dto.duration,
          notes: dto.notes,
        },
      ];
    }

    if (dto.instructions !== undefined) {
      updateData.instructions = dto.instructions;
    }

    return this.prisma.prescription.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, userId: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    await this.prisma.prescription.delete({
      where: { id },
    });

    return { message: 'Prescription deleted successfully' };
  }
}
