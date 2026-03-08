import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePetInsuranceDto,
  UpdatePetInsuranceDto,
} from './dto/pet-insurance.dto';

@Injectable()
export class PetInsuranceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createDto: CreatePetInsuranceDto) {
    // Verify pet belongs to user
    const pet = await this.prisma.pet.findUnique({
      where: { id: createDto.petId },
      select: { ownerId: true },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (pet.ownerId !== userId) {
      throw new ForbiddenException('You can only add insurance for your own pets');
    }

    return this.prisma.petInsurance.create({
      data: {
        petId: createDto.petId,
        provider: createDto.provider,
        policyNumber: createDto.policyNumber,
        startDate: new Date(createDto.startDate),
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
        coverageAmount: createDto.coverageAmount,
        deductible: createDto.deductible,
        coverageDetails: createDto.coverageDetails,
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
      },
    });
  }

  async findAllByPet(petId: string, userId: string) {
    // Verify user owns pet
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
      select: { ownerId: true },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (pet.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this pet');
    }

    return this.prisma.petInsurance.findMany({
      where: { petId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const insurance = await this.prisma.petInsurance.findUnique({
      where: { id },
      include: {
        pet: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!insurance) {
      throw new NotFoundException('Insurance record not found');
    }

    if (insurance.pet.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this insurance record');
    }

    return insurance;
  }

  async update(id: string, userId: string, updateDto: UpdatePetInsuranceDto) {
    const insurance = await this.prisma.petInsurance.findUnique({
      where: { id },
      include: {
        pet: {
          select: { ownerId: true },
        },
      },
    });

    if (!insurance) {
      throw new NotFoundException('Insurance record not found');
    }

    if (insurance.pet.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own pet insurance');
    }

    const updateData: any = {
      provider: updateDto.provider,
      policyNumber: updateDto.policyNumber,
      coverageAmount: updateDto.coverageAmount,
      deductible: updateDto.deductible,
      coverageDetails: updateDto.coverageDetails,
      notes: updateDto.notes,
    };

    if (updateDto.startDate) {
      updateData.startDate = new Date(updateDto.startDate);
    }

    if (updateDto.endDate) {
      updateData.endDate = new Date(updateDto.endDate);
    }

    return this.prisma.petInsurance.update({
      where: { id },
      data: updateData,
    });
  }

  async updateStatus(id: string, userId: string, status: string) {
    const insurance = await this.prisma.petInsurance.findUnique({
      where: { id },
      include: {
        pet: {
          select: { ownerId: true },
        },
      },
    });

    if (!insurance) {
      throw new NotFoundException('Insurance record not found');
    }

    if (insurance.pet.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own pet insurance');
    }

    return this.prisma.petInsurance.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string, userId: string) {
    const insurance = await this.prisma.petInsurance.findUnique({
      where: { id },
      include: {
        pet: {
          select: { ownerId: true },
        },
      },
    });

    if (!insurance) {
      throw new NotFoundException('Insurance record not found');
    }

    if (insurance.pet.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own pet insurance');
    }

    await this.prisma.petInsurance.delete({
      where: { id },
    });

    return { message: 'Insurance record deleted successfully' };
  }
}
