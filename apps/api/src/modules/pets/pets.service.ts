import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePetDto, UpdatePetDto } from './dto/pet.dto';

@Injectable()
export class PetsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, createPetDto: CreatePetDto) {
    // Verify the owner exists and is a pet owner
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId: ownerId },
    });

    if (!petOwner) {
      throw new ForbiddenException('Only pet owners can add pets');
    }

    // Create the pet
    const pet = await this.prisma.pet.create({
      data: {
        ...createPetDto,
        ownerId: petOwner.id,
      },
    });

    return pet;
  }

  async findAll(ownerId: string) {
    // Get the pet owner
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId: ownerId },
    });

    if (!petOwner) {
      throw new ForbiddenException('Only pet owners can view pets');
    }

    // Get all pets for this owner
    const pets = await this.prisma.pet.findMany({
      where: { ownerId: petOwner.id },
      orderBy: { createdAt: 'desc' },
    });

    return pets;
  }

  async findOne(id: string, userId: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { id },
      include: {
        owner: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
        healthRecords: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        vaccinations: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    // Verify ownership
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (pet.ownerId !== petOwner?.id) {
      throw new ForbiddenException('You can only view your own pets');
    }

    return pet;
  }

  async update(id: string, userId: string, updatePetDto: UpdatePetDto) {
    // Verify ownership
    const pet = await this.prisma.pet.findUnique({
      where: { id },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (pet.ownerId !== petOwner?.id) {
      throw new ForbiddenException('You can only update your own pets');
    }

    // Update the pet
    const updatedPet = await this.prisma.pet.update({
      where: { id },
      data: updatePetDto,
    });

    return updatedPet;
  }

  async remove(id: string, userId: string) {
    // Verify ownership
    const pet = await this.prisma.pet.findUnique({
      where: { id },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (pet.ownerId !== petOwner?.id) {
      throw new ForbiddenException('You can only delete your own pets');
    }

    // Delete the pet
    await this.prisma.pet.delete({
      where: { id },
    });

    return { message: 'Pet deleted successfully' };
  }
}
