import { Injectable } from '@nestjs/common';
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
      throw new Error('Veterinarian not found');
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
        petOwner: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        veterinarian: {
          select: {
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
        owner: `${apt.petOwner.user.firstName} ${apt.petOwner.user.lastName}`,
        vet: `Dr. ${apt.veterinarian.user.firstName} ${apt.veterinarian.user.lastName}`,
        createdAt: apt.createdAt,
      })),
    };
  }

  private async sendApprovalEmail(vet: VetWithEmail) {
    await this.emailService.sendEmail({
      to: vet.user.email,
      subject: '✅ Congratulations! Your profile has been verified',
      html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
  <table width="600" style="background-color: #ffffff; margin: 0 auto; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 You're Verified!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <p style="font-size: 16px; color: #333; margin: 0 0 20px;">Dear Veterinarian,</p>

        <p style="font-size: 16px; color: #333; margin: 0 0 30px;">
          Congratulations! Your veterinarian profile has been verified by our admin team.
        </p>

        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 30px;">
          <p style="margin: 0; color: #059669; font-weight: bold;">You can now:</p>
          <ul style="margin: 10px 0 0 0; color: #059669;">
            <li>Accept appointment requests</li>
            <li>Start consulting with pet owners</li>
            <li>Receive payments for your services</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard"
             style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-size: 16px; font-weight: bold;">
            Go to Dashboard
          </a>
        </div>

        <p style="font-size: 14px; color: #666; margin: 30px 0 0;">
          Thank you for joining VetCare Sri Lanka. We're excited to have you on our platform!
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #666;">
          <strong>VetCare Sri Lanka</strong><br>
          Professional Veterinary Care
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });
  }

  private async sendRejectionEmail(vet: VetWithEmail, reason: string) {
    await this.emailService.sendEmail({
      to: vet.user.email,
      subject: 'Profile Verification - Action Required',
      html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
  <table width="600" style="background-color: #ffffff; margin: 0 auto; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="background-color: #f59e0b; padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Profile Needs Revision</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <p style="font-size: 16px; color: #333; margin: 0 0 20px;">Dear Veterinarian,</p>

        <p style="font-size: 16px; color: #333; margin: 0 0 30px;">
          Thank you for registering with VetCare Sri Lanka. After reviewing your profile, we need you to make some updates before we can approve your account.
        </p>

        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 30px;">
          <p style="margin: 0 0 10px; color: #92400e; font-weight: bold;">Reason for revision:</p>
          <p style="margin: 0; color: #92400e;">${reason}</p>
        </div>

        <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
          Please update your profile and our team will review it again.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/vet/profile"
             style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-size: 16px; font-weight: bold;">
            Update Profile
          </a>
        </div>

        <p style="font-size: 14px; color: #666; margin: 30px 0 0;">
          If you have any questions, please contact our support team.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #666;">
          <strong>VetCare Sri Lanka</strong><br>
          support@vetcare.lk
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });
  }

  // User Management
  async getAllUsers(filters?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // Search by name or email
    if (filters?.search) {
      whereClause.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Filter by role
    if (filters?.role) {
      whereClause.role = filters.role;
    }

    // Filter by status (active/suspended)
    if (filters?.status === 'suspended') {
      whereClause.isSuspended = true;
    } else if (filters?.status === 'active') {
      whereClause.isSuspended = false;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isVerified: true,
          isSuspended: true,
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
      users,
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
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isVerified: true,
        isSuspended: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get role-specific details
    let roleDetails = null;

    if (user.role === 'PET_OWNER') {
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
    } else if (user.role === 'VETERINARIAN') {
      roleDetails = await this.prisma.veterinarian.findUnique({
        where: { userId },
        select: {
          id: true,
          licenseNumber: true,
          specializations: true,
          yearsOfExperience: true,
          consultationFeeClinic: true,
          verificationStatus: true,
          averageRating: true,
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
        isSuspended: true,
        updatedAt: new Date(),
      },
    });

    // Send suspension email
    try {
      await this.notificationsService.sendEmail({
        to: user.email,
        subject: 'Account Suspended - VetCare',
        html: `
          <h2>Account Suspended</h2>
          <p>Dear ${user.firstName || 'User'},</p>
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
        isSuspended: false,
        updatedAt: new Date(),
      },
    });

    // Send activation email
    try {
      await this.notificationsService.sendEmail({
        to: user.email,
        subject: 'Account Activated - VetCare',
        html: `
          <h2>Account Activated</h2>
          <p>Dear ${user.firstName || 'User'},</p>
          <p>Your account has been activated. You can now access all services.</p>
          <p>Best regards,<br>VetCare Admin Team</p>
        `,
      });
    } catch (error) {
      console.error('Failed to send activation email:', error);
    }

    return user;
  }
}
