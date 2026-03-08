import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    appointment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    pet: {
      findUnique: jest.fn(),
    },
    veterinarian: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an appointment successfully', async () => {
      const createDto = {
        petId: 'pet-1',
        veterinarianId: 'vet-1',
        scheduledAt: new Date('2024-12-25T10:00:00'),
        type: 'IN_CLINIC',
        notes: 'Regular checkup',
      };

      const mockPet = {
        id: 'pet-1',
        ownerId: 'owner-1',
      };

      const mockAppointment = {
        id: 'appointment-1',
        ...createDto,
        status: 'PENDING',
        createdAt: new Date(),
      };

      mockPrismaService.pet.findUnique.mockResolvedValue(mockPet);
      mockPrismaService.appointment.create.mockResolvedValue(mockAppointment);

      const result = await service.create(createDto, 'owner-1');

      expect(result).toEqual(mockAppointment);
      expect(prisma.appointment.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if pet not found', async () => {
      const createDto = {
        petId: 'invalid-pet',
        veterinarianId: 'vet-1',
        scheduledAt: new Date(),
        type: 'IN_CLINIC',
      };

      mockPrismaService.pet.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, 'owner-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not pet owner', async () => {
      const createDto = {
        petId: 'pet-1',
        veterinarianId: 'vet-1',
        scheduledAt: new Date(),
        type: 'IN_CLINIC',
      };

      const mockPet = {
        id: 'pet-1',
        ownerId: 'owner-1',
      };

      mockPrismaService.pet.findUnique.mockResolvedValue(mockPet);

      await expect(service.create(createDto, 'wrong-owner')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    it('should return appointments for pet owner', async () => {
      const mockAppointments = [
        { id: '1', petId: 'pet-1', status: 'PENDING' },
        { id: '2', petId: 'pet-2', status: 'CONFIRMED' },
      ];

      mockPrismaService.appointment.findMany.mockResolvedValue(mockAppointments);

      const result = await service.findAll('owner-1', 'PET_OWNER');

      expect(result).toEqual(mockAppointments);
      expect(prisma.appointment.findMany).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should cancel appointment successfully', async () => {
      const mockAppointment = {
        id: 'appointment-1',
        status: 'PENDING',
        pet: {
          ownerId: 'owner-1',
        },
      };

      const mockUpdatedAppointment = {
        ...mockAppointment,
        status: 'CANCELLED',
      };

      mockPrismaService.appointment.findUnique.mockResolvedValue(mockAppointment);
      mockPrismaService.appointment.update.mockResolvedValue(mockUpdatedAppointment);

      const result = await service.cancel('appointment-1', 'owner-1', 'PET_OWNER');

      expect(result.status).toBe('CANCELLED');
      expect(prisma.appointment.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if appointment not found', async () => {
      mockPrismaService.appointment.findUnique.mockResolvedValue(null);

      await expect(service.cancel('invalid-id', 'owner-1', 'PET_OWNER')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
