import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { OtpService } from './otp.service';


@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, userType, firstName, lastName, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        phone,
        passwordHash: hashedPassword,
        userType,
        status: 'PENDING_VERIFICATION',
      },
    });

    // Create profile based on user type
    if (userType === 'PET_OWNER' && firstName && lastName) {
      await this.prisma.petOwner.create({
        data:{
          userId: user.id,
          firstName,
          lastName,
        },
      });
    }

    // Send OTP for email verification
    await this.otpService.createEmailVerificationOtp(user.id, user.email);

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.userType);

    return {
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        status: user.status,
      },
      ...tokens,
      message: 'Registration successful. Please check your email for verification code.',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        petOwner: true,
        veterinarian: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account has been suspended');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.userType);

    return {
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        status: user.status,
        profile: user.petOwner || user.veterinarian,
      },
      ...tokens,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        petOwner: true,
        veterinarian: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async refreshTokens(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens(user.id, user.email, user.userType);
  }

  private async generateTokens(userId: string, email: string, userType: string) {
    const payload = { sub: userId, email, userType };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
