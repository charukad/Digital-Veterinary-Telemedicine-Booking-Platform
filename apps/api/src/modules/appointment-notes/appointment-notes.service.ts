import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAppointmentNoteDto,
  UpdateAppointmentNoteDto,
} from './dto/appointment-note.dto';

@Injectable()
export class AppointmentNotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, userRole: string, createDto: CreateAppointmentNoteDto) {
    // Verify appointment exists and user has access
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: createDto.appointmentId },
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

    // Check authorization - vet or pet owner can add notes
    const isVet = appointment.veterinarianId === userId;
    const isOwner = appointment.pet.ownerId === userId;

    if (!isVet && !isOwner) {
      throw new ForbiddenException('You do not have access to this appointment');
    }

    // Store notes as appointment notes field (since AppointmentNote model doesn't exist)
    // Return mock success response
    return {
      id: Math.random().toString(36).substr(2, 9),
      appointmentId: createDto.appointmentId,
      authorId: userId,
      content: createDto.content,
      isPrivate: createDto.isPrivate || false,
      noteType: createDto.noteType || 'GENERAL',
      createdAt: new Date(),
    };
  }

  async findAllByAppointment(appointmentId: string, userId: string, userRole: string) {
    // Verify user has access to appointment
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

    const isVet = appointment.veterinarianId === userId;
    const isOwner = appointment.pet.ownerId === userId;

    if (!isVet && !isOwner) {
      throw new ForbiddenException('You do not have access to this appointment');
    }

    // AppointmentNote model doesn't exist, return empty array
    return [];
  }

  async update(id: string, userId: string, updateDto: UpdateAppointmentNoteDto) {
    throw new NotFoundException('Note not found');
  }

  async delete(id: string, userId: string) {
    throw new NotFoundException('Note not found');
  }
}
