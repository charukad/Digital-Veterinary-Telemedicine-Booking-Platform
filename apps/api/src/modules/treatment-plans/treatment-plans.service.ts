import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTreatmentPlanDto,
  UpdateTreatmentPlanDto,
} from './dto/treatment-plan.dto';

@Injectable()
export class TreatmentPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createDto: CreateTreatmentPlanDto) {
    // TreatmentPlan model not in schema - return mock response
    const pet = await this.prisma.pet.findUnique({
      where: { id: createDto.petId },
      include: { owner: true },
    });

    if (!pet) throw new NotFoundException('Pet not found');

    return {
      id: Math.random().toString(36).substr(2, 9),
      petId: createDto.petId,
      veterinarianId: userId,
      title: createDto.title,
      diagnosis: createDto.diagnosis,
      description: createDto.description,
      startDate: createDto.startDate,
      status: 'ACTIVE',
      createdAt: new Date(),
    };
  }

  async findAllByPet(petId: string, userId: string, userRole: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
      select: { ownerId: true },
    });

    if (!pet) throw new NotFoundException('Pet not found');

    if (userRole === 'PET_OWNER' && pet.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this pet');
    }

    return [];
  }

  async findOne(id: string, userId: string, userRole: string) {
    throw new NotFoundException('Treatment plan not found');
  }

  async update(id: string, userId: string, updateDto: UpdateTreatmentPlanDto) {
    throw new NotFoundException('Treatment plan not found');
  }

  async updateStatus(id: string, userId: string, status: string) {
    throw new NotFoundException('Treatment plan not found');
  }

  async delete(id: string, userId: string) {
    throw new NotFoundException('Treatment plan not found');
  }
}
