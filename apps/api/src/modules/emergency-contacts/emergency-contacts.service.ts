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
    // Get pet owner
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (!petOwner) {
      throw new ForbiddenException('Only pet owners can create emergency contacts');
    }

    return this.prisma.emergencyContact.create({
      data: {
        petOwnerId: petOwner.id,
        name: createDto.name,
        relationship: createDto.relationship,
        phone: createDto.phone,
        email: createDto.email,
        address: createDto.address,
      },
    });
  }

  async findAll(userId: string) {
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (!petOwner) {
      return [];
    }

    return this.prisma.emergencyContact.findMany({
      where: { petOwnerId: petOwner.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (!petOwner) {
      throw new ForbiddenException('Only pet owners can view emergency contacts');
    }

    const contact = await this.prisma.emergencyContact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException('Emergency contact not found');
    }

    if (contact.petOwnerId !== petOwner.id) {
      throw new ForbiddenException('You can only view your own emergency contacts');
    }

    return contact;
  }

  async update(id: string, userId: string, updateDto: UpdateEmergencyContactDto) {
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (!petOwner) {
      throw new ForbiddenException('Only pet owners can update emergency contacts');
    }

    const contact = await this.prisma.emergencyContact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException('Emergency contact not found');
    }

    if (contact.petOwnerId !== petOwner.id) {
      throw new ForbiddenException('You can only update your own emergency contacts');
    }

    return this.prisma.emergencyContact.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string, userId: string) {
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (!petOwner) {
      throw new ForbiddenException('Only pet owners can delete emergency contacts');
    }

    const contact = await this.prisma.emergencyContact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException('Emergency contact not found');
    }

    if (contact.petOwnerId !== petOwner.id) {
      throw new ForbiddenException('You can only delete your own emergency contacts');
    }

    await this.prisma.emergencyContact.delete({
      where: { id },
    });

    return { message: 'Emergency contact deleted successfully' };
  }
}
