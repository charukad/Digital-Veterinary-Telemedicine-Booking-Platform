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
    sendOtp: jest.fn(),
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

  describe('signIn', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.signIn('test@example.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: hashedPassword,
      });

      await expect(service.signIn('test@example.com', 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return tokens if credentials are valid', async () => {
      const password = 'correct-password';
      const hashedPassword = await bcrypt.hash(password, 10);
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: hashedPassword,
        userType: 'PET_OWNER',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.signIn('test@example.com', password);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(mockUser.email);
    });
  });

  describe('signUp', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.signUp({
          email: 'test@example.com',
          password: 'password',
          userType: 'PET_OWNER' as any,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and profile, and send OTP', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'new-user',
        email: 'new@example.com',
        userType: 'PET_OWNER',
      });

      const dto = {
        email: 'new@example.com',
        password: 'password123',
        userType: 'PET_OWNER' as any,
        firstName: 'Test',
        lastName: 'User',
      };

      const result = await service.signUp(dto);

      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.petOwner.create).toHaveBeenCalled();
      expect(otpService.sendOtp).toHaveBeenCalledWith('new@example.com');
      expect(result.message).toContain('Verify your email');
    });
  });
});
