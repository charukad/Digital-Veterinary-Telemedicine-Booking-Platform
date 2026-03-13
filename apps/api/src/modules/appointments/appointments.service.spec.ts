import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    appointment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    pet: {
      findUnique: jest.fn(),
    },
    veterinarian: {
      findUnique: jest.fn(),
    },
    petOwner: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    availabilitySlot: {
      findMany: jest.fn(),
    },
  };

  const mockEmailService = {
    sendStatusUpdate: jest.fn(),
    sendBookingConfirmation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw ForbiddenException if user is not the pet owner', async () => {
      const userId = 'user-1';
      const dto = { petId: 'pet-1', veterinarianId: 'vet-1', scheduledAt: new Date(), type: 'IN_CLINIC' as any };
      
      mockPrismaService.pet.findUnique.mockResolvedValue({ id: 'pet-1', ownerId: 'other-user' });
      mockPrismaService.petOwner.findUnique.mockResolvedValue({ id: 'owner-1', userId });

      await expect(service.create(userId, dto)).rejects.toThrow(ForbiddenException);
    });

    it('should create appointment if all valid', async () => {
      const userId = 'user-1';
      const dto = { petId: 'pet-1', veterinarianId: 'vet-1', scheduledAt: new Date(), type: 'IN_CLINIC' as any };
      
      mockPrismaService.petOwner.findUnique.mockResolvedValue({ id: 'owner-1', userId, firstName: 'John', lastName: 'Doe' });
      mockPrismaService.pet.findUnique.mockResolvedValue({ id: 'pet-1', ownerId: 'owner-1', name: 'Buddy' });
      mockPrismaService.veterinarian.findUnique.mockResolvedValue({ id: 'vet-1', firstName: 'Dr.', lastName: 'Smith' });
      mockPrismaService.user.findUnique.mockResolvedValue({ email: 'owner@example.com' });
      mockPrismaService.appointment.findFirst.mockResolvedValue(null);
      mockPrismaService.appointment.create.mockResolvedValue({ id: 'apt-1', ...dto });

      const result = await service.create(userId, dto);

      expect(result.id).toBe('apt-1');
      expect(prisma.appointment.create).toHaveBeenCalled();
    });
  });

  describe('checkAvailability', () => {
    it('should return unavailable if outside working hours', async () => {
      mockPrismaService.availabilitySlot.findMany.mockResolvedValue([]); // No slots

      const result = await service.checkAvailability('vet-1', '2026-03-10', '10:00');

      expect(result.available).toBe(false);
      expect(result.reason).toContain('working hours');
    });

    it('should return unavailable if conflict exists', async () => {
      // Mock being within working hours
      mockPrismaService.availabilitySlot.findMany.mockResolvedValue([
        { startTime: '09:00', endTime: '17:00', dayOfWeek: 2, isAvailable: true }
      ]);
      
      // Mock existing conflict
      mockPrismaService.appointment.findMany.mockResolvedValue([
        { scheduledAt: new Date('2026-03-10T10:00:00'), durationMinutes: 30 }
      ]);

      const result = await service.checkAvailability('vet-1', '2026-03-10', '10:15');

      expect(result.available).toBe(false);
      expect(result.reason).toContain('already booked');
    });

    it('should return available if no conflicts', async () => {
      mockPrismaService.availabilitySlot.findMany.mockResolvedValue([
        { startTime: '09:00', endTime: '17:00', dayOfWeek: 2, isAvailable: true }
      ]);
      mockPrismaService.appointment.findMany.mockResolvedValue([]);

      const result = await service.checkAvailability('vet-1', '2026-03-10', '10:00');

      expect(result.available).toBe(true);
    });
  });
});
