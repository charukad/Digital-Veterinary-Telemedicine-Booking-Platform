import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateAddressDto) {
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (!petOwner) {
      throw new ForbiddenException('Only pet owners can create addresses');
    }

    // If this is marked as default, unset other defaults
    if (createDto.isDefault) {
      await this.prisma.address.updateMany({
        where: { ownerId: petOwner.id },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        ownerId: petOwner.id,
        // label: createDto.label,
        addressLine1: createDto.addressLine1,
        addressLine2: createDto.addressLine2,
        city: createDto.city,
        // province: createDto.province,
        postalCode: createDto.postalCode,
        latitude: createDto.latitude ? parseFloat(createDto.latitude) : null,
        longitude: createDto.longitude ? parseFloat(createDto.longitude) : null,
        isDefault: createDto.isDefault || false,
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

    return this.prisma.address.findMany({
      where: { ownerId: petOwner.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (!petOwner) {
      throw new ForbiddenException('Access denied');
    }

    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.ownerId !== petOwner.id) {
      throw new ForbiddenException('Access denied');
    }

    return address;
  }

  async update(id: string, userId: string, updateDto: UpdateAddressDto) {
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (!petOwner) {
      throw new ForbiddenException('Access denied');
    }

    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.ownerId !== petOwner.id) {
      throw new ForbiddenException('Access denied');
    }

    // If setting as default, unset others
    if (updateDto.isDefault) {
      await this.prisma.address.updateMany({
        where: {
          ownerId: petOwner.id,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id },
      data: {
        // label: updateDto.label,
        addressLine1: updateDto.addressLine1,
        addressLine2: updateDto.addressLine2,
        city: updateDto.city,
        // province: updateDto.province,
        postalCode: updateDto.postalCode,
        latitude: updateDto.latitude ? parseFloat(updateDto.latitude) : undefined,
        longitude: updateDto.longitude ? parseFloat(updateDto.longitude) : undefined,
        isDefault: updateDto.isDefault,
      },
    });
  }

  async remove(id: string, userId: string) {
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (!petOwner) {
      throw new ForbiddenException('Access denied');
    }

    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.ownerId !== petOwner.id) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.address.delete({
      where: { id },
    });

    return { message: 'Address deleted successfully' };
  }

  async setDefault(id: string, userId: string) {
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (!petOwner) {
      throw new ForbiddenException('Access denied');
    }

    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.ownerId !== petOwner.id) {
      throw new ForbiddenException('Access denied');
    }

    // Unset all other defaults
    await this.prisma.address.updateMany({
      where: {
        ownerId: petOwner.id,
        id: { not: id },
      },
      data: { isDefault: false },
    });

    // Set this as default
    return this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}
