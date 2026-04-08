import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';

interface VetWithEmail {
  id: string;
  user: {
    email: string;
  };
}

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async getVerificationQueue() {
    return this.prisma.veterinarian.findMany({
      where: { verified: false },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            createdAt: true,
          },
        },
        qualifications: true,
        specializations: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveVeterinarian(vetId: string) {
    // Update veterinarian
    const vet = await this.prisma.veterinarian.update({
      where: { id: vetId },
      data: { verified: true },
      select: {
        id: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    // Send approval email
    await this.sendApprovalEmail(vet);

    return vet;
  }

  async rejectVeterinarian(vetId: string, reason: string) {
    const vet = await this.prisma.veterinarian.findUnique({
      where: { id: vetId },
      select: {
        id: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!vet) {
      throw new NotFoundException('Veterinarian not found');
    }

    // Send rejection email
    try {
      await this.sendRejectionEmail(vet, reason);
    } catch (error) {
      console.log('Failed to send rejection email:', error);
    }

    return {
      message: 'Veterinarian profile rejected',
      email: 'rejection_sent',
    };
  }

  async getStats() {
    // Get counts
    const [
      totalUsers,
      totalVets,
      verifiedVets,
      pendingVets,
      totalAppointments,
      completedAppointments,
      totalPayments,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.veterinarian.count(),
      this.prisma.veterinarian.count({ where: { verified: true } }),
      this.prisma.veterinarian.count({ where: { verified: false } }),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.payment.count({ where: { status: 'COMPLETED' } }),
    ]);

    // Get revenue
    const totalRevenue = await this.prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    });

    // Get recent appointments
    const recentAppointments = await this.prisma.appointment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        status: true,
        scheduledAt: true,
        createdAt: true,
        owner: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        veterinarian: {
          include: {
            user: true
          }
        },
      },
    });

    return {
      counts: {
        totalUsers,
        totalVets,
        verifiedVets,
        pendingVets,
        totalAppointments,
        completedAppointments,
        totalPayments,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
      },
      recentActivity: recentAppointments.map((apt) => ({
        id: apt.id,
        type: apt.type,
        status: apt.status,
        date: apt.scheduledAt,
        owner: `${apt.owner?.firstName || 'Unknown'} ${apt.owner?.lastName || ''}`,
        vet: `Dr. ${apt.veterinarian?.user?.email || 'Unknown'}`, // Fallback since names are in nested profiles
        createdAt: apt.createdAt,
      })),
    };
  }

  // User Management
  async getAllUsers(filters?: {
    search?: string;
    userType?: any;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // Search by email or phone (names are in profiles)
    if (filters?.search) {
      whereClause.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Filter by userType
    if (filters?.userType) {
      whereClause.userType = filters.userType;
    }

    // Filter by status
    if (filters?.status) {
      whereClause.status = filters.status;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          userType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where: whereClause }),
    ]);

    return {
      users: users.map(u => ({
        ...u,
        firstName: u.firstName || '',
        lastName: u.lastName || '',
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        userType: true,
        status: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get role-specific details
    let roleDetails: any = null;

    if (user.userType === 'PET_OWNER') {
      roleDetails = await this.prisma.petOwner.findUnique({
        where: { userId },
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
              status: true,
              scheduledAt: true,
            },
            take: 5,
            orderBy: { scheduledAt: 'desc' },
          },
        },
      });
    } else if (user.userType === 'VETERINARIAN') {
      roleDetails = await this.prisma.veterinarian.findUnique({
        where: { userId },
        select: {
          id: true,
          licenseNumber: true,
          specializations: true,
          yearsOfExperience: true,
          consultationFeeClinic: true,
          verified: true,
          rating: true,
          reviewCount: true,
        },
      });
    }

    return {
      ...user,
      roleDetails,
    };
  }

  async suspendUser(userId: string, reason?: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'SUSPENDED',
        updatedAt: new Date(),
      },
    });

    // Send suspension email
    try {
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Account Suspended - VetCare',
        html: `
          <h2>Account Suspended</h2>
          <p>Dear User,</p>
          <p>Your account has been suspended.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>If you believe this is an error, please contact support.</p>
          <p>Best regards,<br>VetCare Admin Team</p>
        `,
      });
    } catch (error) {
      console.error('Failed to send suspension email:', error);
    }

    return user;
  }

  async activateUser(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
    });

    // Send activation email
    try {
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Account Activated - VetCare',
        html: `
          <h2>Account Activated</h2>
          <p>Dear User,</p>
          <p>Your account has been activated. You can now access all services.</p>
          <p>Best regards,<br>VetCare Admin Team</p>
        `,
      });
    } catch (error) {
      console.error('Failed to send activation email:', error);
    }

    return user;
  }
  private async sendApprovalEmail(vet: any) {
    try {
      if (!vet.user?.email) return;
      await this.emailService.sendEmail({
        to: vet.user.email,
        subject: 'Veterinarian Profile Approved - VetCare',
        html: `
          <h2>Profile Approved</h2>
          <p>Dear Veterinarian,</p>
          <p>Your profile has been approved! You can now start accepting appointments.</p>
          <p>Best regards,<br>VetCare Admin Team</p>
        `,
      });
    } catch (error) {
      console.error('Failed to send approval email:', error);
    }
  }

  private async sendRejectionEmail(vet: any, reason: string) {
    if (!vet.user?.email) return;
    await this.emailService.sendEmail({
      to: vet.user.email,
      subject: 'Veterinarian Profile Update Required - VetCare',
      html: `
        <h2>Profile Update Required</h2>
        <p>Dear Veterinarian,</p>
        <p>We've reviewed your profile but require more information or corrections.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please update your profile to proceed.</p>
        <p>Best regards,<br>VetCare Admin Team</p>
      `,
    });
  }
}
