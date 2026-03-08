import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TelemedicineService {
  private readonly appId: string;
  private readonly appCertificate: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.appId = this.configService.get<string>('AGORA_APP_ID');
    this.appCertificate = this.configService.get<string>('AGORA_APP_CERTIFICATE');

    if (!this.appId || !this.appCertificate) {
      console.warn('Agora App ID or Certificate is missing. Telemedicine features will be limited.');
    }
  }

  async generateToken(appointmentId: string, userId: string) {
    // 1. Fetch appointment details
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        pet: { include: { owner: true } },
        veterinarian: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // 2. Verify appointment type is TELEMEDICINE
    if (appointment.type !== 'TELEMEDICINE') {
      throw new BadRequestException('This appointment is not a telemedicine consultation');
    }

    // 3. Verify user is part of the appointment
    const isOwner = appointment.pet.owner.userId === userId;
    const isVet = appointment.veterinarian.userId === userId;

    if (!isOwner && !isVet) {
      throw new ForbiddenException('You are not authorized to join this consultation');
    }

    // 4. Verify appointment status is appropriate (CONFIRMED or IN_PROGRESS)
    if (appointment.status !== 'CONFIRMED' && appointment.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Consultation is not in a joinable state');
    }

    // 5. Generate Agora Token
    const channelName = `appointment-${appointmentId}`;
    const uid = 0; // Use 0 to let Agora assign a random UID or use user numeric ID if available
    const role = isVet ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const privilegeExpireTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour

    const token = RtcTokenBuilder.buildTokenWithUid(
      this.appId,
      this.appCertificate,
      channelName,
      uid,
      role,
      privilegeExpireTime,
      privilegeExpireTime,
    );

    // 6. Update appointment status to IN_PROGRESS if it was CONFIRMED
    if (appointment.status === 'CONFIRMED' && isVet) {
      await this.prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'IN_PROGRESS' },
      });

      // Initialize consultation record if it doesn't exist
      await this.prisma.consultation.upsert({
        where: { appointmentId },
        update: { startTime: new Date(), agoraChannelName: channelName },
        create: {
          appointmentId,
          veterinarianId: appointment.veterinarianId,
          startTime: new Date(),
          agoraChannelName: channelName,
        },
      });
    }

    return {
      token,
      channelName,
      appId: this.appId,
      uid,
    };
  }
}
