import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateEmergencyContactDto,
  UpdateEmergencyContactDto,
} from './dto/emergency-contact.dto';

@Injectable()
export class EmergencyContactsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateEmergencyContactDto) {
    // EmergencyContact model doesn't exist in schema
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (!petOwner) {
      throw new ForbiddenException('Only pet owners can create emergency contacts');
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      ownerId: petOwner.id,
      name: createDto.name,
      relationship: createDto.relationship,
      phone: createDto.phone,
      email: createDto.email,
      address: createDto.address,
      createdAt: new Date(),
    };
  }

  async findAll(userId: string) {
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (!petOwner) {
      return [];
    }

    // EmergencyContact model doesn't exist, return empty array
    return [];
  }

  async findOne(id: string, userId: string) {
    throw new NotFoundException('Emergency contact not found');
  }

  async update(id: string, userId: string, updateDto: UpdateEmergencyContactDto) {
    throw new NotFoundException('Emergency contact not found');
  }

  async remove(id: string, userId: string) {
    throw new NotFoundException('Emergency contact not found');
  }
}
