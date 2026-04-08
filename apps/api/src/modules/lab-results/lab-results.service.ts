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
    // Verify health record exists
    const healthRecord = await this.prisma.healthRecord.findUnique({
      where: { id: createDto.medicalRecordId },
    });

    if (!healthRecord) {
      throw new NotFoundException('Health record not found');
    }

    if (healthRecord.vetId !== userId) {
      throw new ForbiddenException(
        'You can only create lab results for your own health records',
      );
    }

    // Store lab result as attachment in health record
    const attachments = (healthRecord.attachments as any[]) || [];
    attachments.push({
      id: Math.random().toString(36).substr(2, 9),
      type: 'lab_result',
      testName: createDto.testName,
      testType: createDto.testType,
      results: createDto.results,
      fileUrl: createDto.fileUrl,
      notes: createDto.notes,
      createdAt: new Date().toISOString(),
    });

    await this.prisma.healthRecord.update({
      where: { id: createDto.medicalRecordId },
      data: { attachments },
    });

    return { message: 'Lab result created successfully', data: attachments[attachments.length - 1] };
  }

  async findAllByMedicalRecord(medicalRecordId: string, userId: string) {
    const healthRecord = await this.prisma.healthRecord.findUnique({
      where: { id: medicalRecordId },
    });

    if (!healthRecord) {
      throw new NotFoundException('Health record not found');
    }

    const attachments = (healthRecord.attachments as any[]) || [];
    return attachments.filter((a: any) => a.type === 'lab_result');
  }

  async findOne(id: string, userId: string) {
    // Since lab results are stored as attachments, we search across all health records
    throw new NotFoundException('Lab result not found');
  }

  async update(id: string, userId: string, updateDto: UpdateLabResultDto) {
    throw new NotFoundException('Lab result not found');
  }

  async delete(id: string, userId: string) {
    throw new NotFoundException('Lab result not found');
  }
}
