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

    // Only vets can create private notes
    const isPrivate = userRole === 'VETERINARIAN' && createDto.isPrivate === true;

    return this.prisma.appointmentNote.create({
      data: {
        appointmentId: createDto.appointmentId,
        authorId: userId,
        content: createDto.content,
        isPrivate,
        noteType: createDto.noteType || 'GENERAL',
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
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

    // Build where clause based on user role
    const whereClause: any = { appointmentId };

    // Pet owners can't see private notes
    if (userRole === 'PET_OWNER') {
      whereClause.isPrivate = false;
    }

    return this.prisma.appointmentNote.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: string, userId: string, updateDto: UpdateAppointmentNoteDto) {
    const note = await this.prisma.appointmentNote.findUnique({
      where: { id },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Only the author can update their own note
    if (note.authorId !== userId) {
      throw new ForbiddenException('You can only update your own notes');
    }

    return this.prisma.appointmentNote.update({
      where: { id },
      data: {
        content: updateDto.content,
        noteType: updateDto.noteType,
        isPrivate: updateDto.isPrivate,
      },
    });
  }

  async delete(id: string, userId: string) {
    const note = await this.prisma.appointmentNote.findUnique({
      where: { id },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own notes');
    }

    await this.prisma.appointmentNote.delete({
      where: { id },
    });

    return { message: 'Note deleted successfully' };
  }
}
