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
    // Verify the vet owns this pet relationship (pet must have had appointment with this vet)
    const pet = await this.prisma.pet.findUnique({
      where: { id: createDto.petId },
      include: {
        owner: true,
      },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    // Store steps as JSON
    const stepsData = createDto.steps || [];

    return this.prisma.treatmentPlan.create({
      data: {
        petId: createDto.petId,
        veterinarianId: userId,
        medicalRecordId: createDto.medicalRecordId,
        title: createDto.title,
        diagnosis: createDto.diagnosis,
        description: createDto.description,
        startDate: new Date(createDto.startDate),
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
        steps: stepsData,
        notes: createDto.notes,
        status: 'ACTIVE',
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
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

  async findAllByPet(petId: string, userId: string, userRole: string) {
    // Verify access - either owner or vet
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
      select: { ownerId: true },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (userRole === 'PET_OWNER' && pet.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this pet');
    }

    return this.prisma.treatmentPlan.findMany({
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const plan = await this.prisma.treatmentPlan.findUnique({
      where: { id },
      include: {
        pet: {
          include: {
            owner: true,
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
        medicalRecord: true,
      },
    });

    if (!plan) {
      throw new NotFoundException('Treatment plan not found');
    }

    // Check authorization
    const isVet = plan.veterinarianId === userId;
    const isOwner = plan.pet.ownerId === userId;

    if (!isVet && !isOwner) {
      throw new ForbiddenException('You do not have access to this treatment plan');
    }

    return plan;
  }

  async update(id: string, userId: string, updateDto: UpdateTreatmentPlanDto) {
    const plan = await this.prisma.treatmentPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Treatment plan not found');
    }

    // Only the vet who created the plan can update it
    if (plan.veterinarianId !== userId) {
      throw new ForbiddenException(
        'You can only update your own treatment plans',
      );
    }

    const updateData: any = {
      title: updateDto.title,
      diagnosis: updateDto.diagnosis,
      description: updateDto.description,
      notes: updateDto.notes,
    };

    if (updateDto.startDate) {
      updateData.startDate = new Date(updateDto.startDate);
    }

    if (updateDto.endDate) {
      updateData.endDate = new Date(updateDto.endDate);
    }

    if (updateDto.steps) {
      updateData.steps = updateDto.steps;
    }

    return this.prisma.treatmentPlan.update({
      where: { id },
      data: updateData,
    });
  }

  async updateStatus(id: string, userId: string, status: string) {
    const plan = await this.prisma.treatmentPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Treatment plan not found');
    }

    if (plan.veterinarianId !== userId) {
      throw new ForbiddenException(
        'You can only update your own treatment plans',
      );
    }

    return this.prisma.treatmentPlan.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string, userId: string) {
    const plan = await this.prisma.treatmentPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Treatment plan not found');
    }

    if (plan.veterinarianId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own treatment plans',
      );
    }

    await this.prisma.treatmentPlan.delete({
      where: { id },
    });

    return { message: 'Treatment plan deleted successfully' };
  }
}
