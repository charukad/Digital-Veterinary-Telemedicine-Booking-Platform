import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FilterUsersDto, UpdateUserStatusDto } from './dto/admin-filters.dto';

@Injectable()
export class AdminUserManagementService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all users with advanced filtering
   */
  async getAllUsers(filters: FilterUsersDto = {}) {
    const { type, search, status } = filters;

    const where: any = {};

    // Filter by user type
    if (type && type !== 'all') {
      where.userType = type;
    }

    // Search by name or email
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          userType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          petOwner: {
            select: {
              id: true,
              phone: true,
              _count: {
                select: { pets: true },
              },
            },
          },
          veterinarian: {
            select: {
              id: true,
              licenseNumber: true,
              specialization: true,
              verificationStatus: true,
              _count: {
                select: { appointments: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      filtered: users.length,
    };
  }

  /**
   * Get user details by ID
   */
  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        petOwner: {
          include: {
            pets: {
              select: {
                id: true,
                name: true,
                species: true,
                breed: true,
              },
            },
            appointments: {
              select: {
                id: true,
                scheduledAt: true,
                status: true,
                type: true,
              },
              take: 10,
              orderBy: { scheduledAt: 'desc' },
            },
          },
        },
        veterinarian: {
          include: {
            appointments: {
              select: {
                id: true,
                scheduledAt: true,
                status: true,
              },
              take: 10,
              orderBy: { scheduledAt: 'desc' },
            },
            reviews: {
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
              },
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user status (suspend/activate)
   */
  async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: dto.status,
      },
    });

    // TODO: Send notification to user about status change
    // TODO: Log admin action

    return updated;
  }

  /**
   * Get user statistics
   */
  async getUserStatistics() {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      petOwners,
      veterinarians,
      admins,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.user.count({ where: { userType: 'PET_OWNER' } }),
      this.prisma.user.count({ where: { userType: 'VETERINARIAN' } }),
      this.prisma.user.count({ where: { userType: 'ADMIN' } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      suspended: suspendedUsers,
      byType: {
        petOwners,
        veterinarians,
        admins,
      },
      recentSignups: recentUsers,
    };
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete by updating status
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'DELETED',
        email: `deleted_${Date.now()}_${user.email}`, // Prevent email conflicts
      },
    });

    return { message: 'User deleted successfully' };
  }
}
