import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class OtpService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Generate a 6-digit OTP code
   */
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Create and send OTP for email verification
   */
  async createEmailVerificationOtp(userId: string, email: string): Promise<void> {
    // Check rate limiting - max 3 OTPs per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOtps = await this.prisma.oTP.count({
      where: {
        userId,
        type: 'email_verification',
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentOtps >= 3) {
      throw new BadRequestException('Too many OTP requests. Please try again later.');
    }

    // Invalidate previous OTPs
    await this.prisma.oTP.deleteMany({
      where: {
        userId,
        type: 'email_verification',
        verified: false,
      },
    });

    // Generate new OTP
    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.oTP.create({
      data: {
        userId,
        code,
        type: 'email_verification',
        expiresAt,
      },
    });

    // Send OTP email
    await this.emailService.sendMail({
      to: email,
      subject: 'VetCare - Email Verification Code',
      text: `Your verification code is: ${code}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px; letter-spacing: 8px;">
            ${code}
          </h1>
          <p>This code will expire in <strong>5 minutes</strong>.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    });
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(userId: string, code: string, type: string = 'email_verification'): Promise<boolean> {
    const otp = await this.prisma.oTP.findFirst({
      where: {
        userId,
        type,
        verified: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new BadRequestException('No OTP found. Please request a new code.');
    }

    // Check if expired
    if (new Date() > otp.expiresAt) {
      throw new BadRequestException('OTP has expired. Please request a new code.');
    }

    // Check attempts (max 3)
    if (otp.attempts >= 3) {
      throw new BadRequestException('Too many failed attempts. Please request a new code.');
    }

    // Verify code
    if (otp.code !== code.trim()) {
      // Increment attempts
      await this.prisma.oTP.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });

      throw new UnauthorizedException('Invalid OTP code.');
    }

    // Mark as verified
    await this.prisma.oTP.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    // Update user email verification status
    if (type === 'email_verification') {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified: true,
          status: 'ACTIVE',
        },
      });
    }

    return true;
  }

  /**
   * Resend OTP
   */
  async resendOtp(userId: string, email: string, type: string = 'email_verification'): Promise<void> {
    if (type === 'email_verification') {
      await this.createEmailVerificationOtp(userId, email);
    }
  }

  /**
   * Create OTP for password reset
   */
  async createPasswordResetOtp(userId: string, email: string): Promise<void> {
    // Similar to email verification but different type
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOtps = await this.prisma.oTP.count({
      where: {
        userId,
        type: 'password_reset',
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentOtps >= 3) {
      throw new BadRequestException('Too many password reset requests. Please try again later.');
    }

    await this.prisma.oTP.deleteMany({
      where: {
        userId,
        type: 'password_reset',
        verified: false,
      },
    });

    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes for password reset

    await this.prisma.oTP.create({
      data: {
        userId,
        code,
        type: 'password_reset',
        expiresAt,
      },
    });

    await this.emailService.sendMail({
      to: email,
      subject: 'VetCare - Password Reset Code',
      text: `Your password reset code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Your password reset code is:</p>
          <h1 style="background: #f44336; color: white; padding: 20px; text-align: center; border-radius: 8px; letter-spacing: 8px;">
            ${code}
          </h1>
          <p>This code will expire in <strong>15 minutes</strong>.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you didn't request this code, please secure your account immediately.
          </p>
        </div>
      `,
    });
  }
}
