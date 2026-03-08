import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        petOwner: true,
        veterinarian: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Exclude passwordHash from return
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;

  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        petOwner: true,
        veterinarian: true,
      },
    });

    if (!user) {
      return null;
    }

    // Exclude passwordHash from return
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(id: string, data: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: {
        petOwner: true,
        veterinarian: true,
      },
    });

    // Exclude passwordHash from return
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getNotificationPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailAppointmentReminders: true,
        emailAppointmentConfirmations: true,
        emailPaymentReceipts: true,
        emailPromotions: true,
        emailSystemUpdates: true,
        smsAppointmentReminders: true,
        smsPaymentConfirmations: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateNotificationPreferences(userId: string, preferences: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: preferences,
      select: {
        id: true,
        email: true,
        emailAppointmentReminders: true,
        emailAppointmentConfirmations: true,
        emailPaymentReceipts: true,
        emailPromotions: true,
        emailSystemUpdates: true,
        smsAppointmentReminders: true,
        smsPaymentConfirmations: true,
      },
    });
  }
}
