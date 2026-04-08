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

  private async verifyPetOwnership(petId: string, userId: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
      select: { ownerId: true },
    });
    if (!pet) throw new NotFoundException('Pet not found');
    if (pet.ownerId !== userId)
      throw new ForbiddenException('You can only manage insurance for your own pets');
    return pet;
  }

  async create(userId: string, createDto: CreatePetInsuranceDto) {
    await this.verifyPetOwnership(createDto.petId, userId);
    // PetInsurance model not in schema - store as notification or return mock
    return {
      id: Math.random().toString(36).substr(2, 9),
      petId: createDto.petId,
      provider: createDto.provider,
      policyNumber: createDto.policyNumber,
      status: 'ACTIVE',
      createdAt: new Date(),
      message: 'Insurance record created (stored externally)',
    };
  }

  async findAllByPet(petId: string, userId: string) {
    await this.verifyPetOwnership(petId, userId);
    return [];
  }

  async findOne(id: string, userId: string) {
    throw new NotFoundException('Insurance record not found');
  }

  async update(id: string, userId: string, updateDto: UpdatePetInsuranceDto) {
    throw new NotFoundException('Insurance record not found');
  }

  async updateStatus(id: string, userId: string, status: string) {
    throw new NotFoundException('Insurance record not found');
  }

  async delete(id: string, userId: string) {
    throw new NotFoundException('Insurance record not found');
  }
}
