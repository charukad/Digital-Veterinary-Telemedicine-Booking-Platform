import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { AppointmentStatus } from '@vetcare/types';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(userId: string, createDto: CreateAppointmentDto) {
    // Get pet owner
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (!petOwner) {
      throw new ForbiddenException('Only pet owners can book appointments');
    }

    // Verify pet belongs to user
    const pet = await this.prisma.pet.findUnique({
      where: { id: createDto.petId },
    });

    if (!pet || pet.ownerId !== petOwner.id) {
      throw new ForbiddenException('You can only book appointments for your own pets');
    }

    // Verify veterinarian exists
    const vet = await this.prisma.veterinarian.findUnique({
      where: { id: createDto.veterinarianId },
    });

    if (!vet) {
      throw new NotFoundException('Veterinarian not found');
    }

    // Check for scheduling conflicts
    const scheduledAt = new Date(createDto.scheduledAt);
    const durationMinutes = createDto.durationMinutes || 30;
    const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60000);

    const conflict = await this.prisma.appointment.findFirst({
      where: {
        veterinarianId: createDto.veterinarianId,
        status: {
          notIn: ['CANCELLED', 'COMPLETED'],
        },
        OR: [
          {
            AND: [
              { scheduledAt: { lte: scheduledAt } },
              {
                scheduledAt: {
                  gte: new Date(scheduledAt.getTime() - 30 * 60000),
                },
              },
            ],
          },
        ],
      },
    });

    if (conflict) {
      throw new BadRequestException('Veterinarian is not available at this time');
    }

    // Create appointment
    const appointment = await this.prisma.appointment.create({
      data: {
        ...createDto,
        ownerId: petOwner.id,
        scheduledAt,
        durationMinutes: durationMinutes,
      },
      include: {
        pet: true,
        veterinarian: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
        clinic: true,
      },
    });

    // Send booking confirmation email
    try {
      const ownerUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (ownerUser?.email) {
        await this.emailService.sendBookingConfirmation({
          to: ownerUser.email,
          ownerName: `${petOwner.firstName || ''} ${petOwner.lastName || ''}`.trim() || 'Pet Owner',
          petName: pet.name,
          vetName: `Dr. ${(vet as any).user?.firstName || vet.userId || ''} ${(vet as any).user?.lastName || ''}`.trim() || 'Veterinarian',
          appointmentDate: scheduledAt.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          appointmentTime: scheduledAt.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          appointmentType: createDto.type.replace('_', ' '),
          clinicName: appointment.clinic?.name,
          clinicAddress: appointment.clinic?.address,
        });
      }
    } catch (error) {
      // Log error but don't fail the appointment creation
      console.error('Failed to send booking confirmation email:', error);
    }

    return appointment;
  }

  async findAll(
    userId: string,
    role: string,
    filters?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      petId?: string;
    },
  ) {
    // Build where clause based on role
    const whereClause: any = {};

    if (role === 'PET_OWNER') {
      const petOwner = await this.prisma.petOwner.findUnique({
        where: { userId },
      });

      if (!petOwner) {
        return [];
      }
      whereClause.ownerId = petOwner.id;
    } else if (role === 'VETERINARIAN') {
      const vet = await this.prisma.veterinarian.findUnique({
        where: { userId },
      });

      if (!vet) {
        return [];
      }
      whereClause.veterinarianId = vet.id;
    }

    // Apply filters
    if (filters?.status) {
      whereClause.status = filters.status;
    }

    if (filters?.petId) {
      whereClause.petId = filters.petId;
    }

    if (filters?.startDate || filters?.endDate) {
      whereClause.scheduledAt = {};
      if (filters.startDate) {
        whereClause.scheduledAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.scheduledAt.lte = new Date(filters.endDate);
      }
    }

    return this.prisma.appointment.findMany({
      where: whereClause,
      include: {
        pet: {
          include: {
            owner: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        veterinarian: {
          select: {
            id: true,
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        owner: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        clinic: true,
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        pet: {
          include: {
            owner: true,
          },
        },
        veterinarian: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
        clinic: true,
        owner: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Verify access
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    const vet = await this.prisma.veterinarian.findUnique({
      where: { userId },
    });

    const hasAccess =
      appointment.ownerId === petOwner?.id ||
      appointment.veterinarianId === vet?.id;

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this appointment');
    }

    return appointment;
  }

  async update(id: string, userId: string, updateDto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id, userId);

    // Only allow certain status transitions
    if (updateDto.status) {
      const validTransitions: Record<string, string[]> = {
        PENDING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
        IN_PROGRESS: ['COMPLETED'],
      };

      const allowed = validTransitions[appointment.status];
      if (!allowed || !allowed.includes(updateDto.status)) {
        throw new BadRequestException('Invalid status transition');
      }
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: updateDto,
      include: {
        pet: true,
        veterinarian: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        clinic: true,
        owner: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    // Send status update email if status changed
    if (updateDto.status && updated.owner?.user?.email) {
      try {
        await this.emailService.sendStatusUpdate({
          to: updated.owner.user.email,
          ownerName: `${updated.owner.firstName || ''} ${updated.owner.lastName || ''}`.trim() || 'Pet Owner',
          petName: updated.pet.name,
          oldStatus: appointment.status,
          newStatus: updated.status,
          vetName: `Dr. ${(updated.veterinarian as any).user?.firstName || ''} ${(updated.veterinarian as any).user?.lastName || ''}`.trim() || 'Veterinarian',
        });
      } catch (error) {
        console.error('Failed to send status update email:', error);
      }
    }

    return updated;
  }

  async cancel(id: string, userId: string) {
    return this.update(id, userId, { status: AppointmentStatus.CANCELLED });
  }

  async checkAvailability(vetId: string, date: string, startTime: string) {
    // Parse the requested start time
    const requestedStart = new Date(`${date}T${startTime}`);
    const dayOfWeek = requestedStart.getDay();
    const durationMinutes = 30; // Default consultation duration
    const requestedEnd = new Date(requestedStart.getTime() + durationMinutes * 60000);

    // 1. Check if the vet has an availability slot for this day/time
    const timeToMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const requestedStartMinutes = requestedStart.getHours() * 60 + requestedStart.getMinutes();
    const requestedEndMinutes = requestedStartMinutes + durationMinutes;

    const availableSlots = await this.prisma.availabilitySlot.findMany({
      where: {
        veterinarianId: vetId,
        dayOfWeek,
        isAvailable: true,
      },
    });

    const isWithinSlot = availableSlots.some(slot => {
      const slotStart = timeToMinutes(slot.startTime);
      const slotEnd = timeToMinutes(slot.endTime);
      return requestedStartMinutes >= slotStart && requestedEndMinutes <= slotEnd;
    });

    if (!isWithinSlot) {
      return {
        available: false,
        reason: 'Outside of veterinarian working hours',
        requestedSlot: { date, startTime },
      };
    }

    // 2. Check for conflicting appointments
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const conflicts = await this.prisma.appointment.findMany({
      where: {
        veterinarianId: vetId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ['CANCELLED', 'COMPLETED'],
        },
      },
      select: {
        id: true,
        scheduledAt: true,
        durationMinutes: true,
        status: true,
      },
    });

    const hasConflict = conflicts.some((appointment) => {
      const existingStart = new Date(appointment.scheduledAt);
      const existingEnd = new Date(
        existingStart.getTime() + appointment.durationMinutes * 60000,
      );

      return (
        (requestedStart >= existingStart && requestedStart < existingEnd) ||
        (requestedEnd > existingStart && requestedEnd <= existingEnd) ||
        (requestedStart <= existingStart && requestedEnd >= existingEnd)
      );
    });

    return {
      available: !hasConflict,
      reason: hasConflict ? 'Time slot already booked' : null,
      conflictingAppointments: hasConflict ? conflicts : [],
      requestedSlot: {
        date,
        startTime,
        endTime: `${requestedEnd.getHours().toString().padStart(2, '0')}:${requestedEnd.getMinutes().toString().padStart(2, '0')}`,
      },
    };
  }

  async reschedule(
    appointmentId: string,
    userId: string,
    rescheduleDto: any,
  ) {
    // Find appointment
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        pet: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check authorization - only owner can reschedule
    if (appointment.pet.ownerId !== userId && appointment.ownerId !== userId) {
      throw new ForbiddenException('You can only reschedule your own appointments');
    }

    // Check if appointment can be rescheduled
    if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
      throw new BadRequestException(
        'Cannot reschedule completed or cancelled appointments',
      );
    }

    // Validate new slot availability
    const newDateTime = new Date(`${rescheduleDto.newDate}T${rescheduleDto.newStartTime}`);

    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        veterinarianId: appointment.veterinarianId,
        scheduledAt: newDateTime,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        id: {
          not: appointmentId,
        },
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException('This time slot is not available');
    }

    // Update appointment
    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        scheduledAt: newDateTime,
        notes: rescheduleDto.reason
          ? `Rescheduled: ${rescheduleDto.reason}. Previous notes: ${appointment.notes || ''}`
          : appointment.notes,
      },
      include: {
        pet: true,
        veterinarian: {
          include: {
            user: true,
          },
        },
      },
    });

    // TODO: Send rescheduling notification to both parties

    return updated;
  }
}
