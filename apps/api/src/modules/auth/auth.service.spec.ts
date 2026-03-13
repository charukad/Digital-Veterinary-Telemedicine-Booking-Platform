import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from './otp.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let otpService: OtpService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    petOwner: {
      create: jest.fn(),
    },
    veterinarian: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockOtpService = {
    createEmailVerificationOtp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: OtpService, useValue: mockOtpService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    otpService = module.get<OtpService>(OtpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login({ email: 'test@example.com', password: 'password' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        status: 'ACTIVE',
      });

      await expect(service.login({ email: 'test@example.com', password: 'wrong-password' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return tokens if credentials are valid', async () => {
      const password = 'correct-password';
      const hashedPassword = await bcrypt.hash(password, 10);
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        userType: 'PET_OWNER',
        status: 'ACTIVE',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.login({ email: 'test@example.com', password });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(mockUser.email);
    });
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password',
          userType: 'PET_OWNER' as any,
          firstName: 'Test',
          lastName: 'User',
          phone: '1234567890',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and profile, and send OTP', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const mockUser = {
        id: 'new-user',
        email: 'new@example.com',
        userType: 'PET_OWNER',
        status: 'PENDING_VERIFICATION',
      };
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const dto = {
        email: 'new@example.com',
        password: 'password123',
        userType: 'PET_OWNER' as any,
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890',
      };

      const result = await service.register(dto);

      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.petOwner.create).toHaveBeenCalled();
      expect(otpService.createEmailVerificationOtp).toHaveBeenCalledWith(mockUser.id, mockUser.email);
      expect(result.message).toContain('verification code');
    });
  });
});
