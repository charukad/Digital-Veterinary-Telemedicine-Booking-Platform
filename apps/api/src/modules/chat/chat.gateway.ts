import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, replace with specific frontend URL
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException();
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.user = payload;
      console.log(`Client connected: ${client.id}, User: ${payload.sub}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { consultationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { consultationId } = data;
    const userId = client.data.user.sub;

    // Verify user is authorized for this consultation
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        appointment: {
          include: {
            pet: { include: { owner: true } },
            veterinarian: true,
          },
        },
      },
    });

    if (!consultation) {
      return { error: 'Consultation not found' };
    }

    const isAuthorized = 
      consultation.appointment.pet.owner.userId === userId ||
      consultation.appointment.veterinarian.userId === userId;

    if (!isAuthorized) {
      return { error: 'Not authorized' };
    }

    client.join(consultationId);
    return { success: true, room: consultationId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { consultationId: string; content: string; messageType?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { consultationId, content, messageType = 'text' } = data;
    const userId = client.data.user.sub;
    const userType = client.data.user.userType;

    // Persist message to database
    const message = await this.prisma.chatMessage.create({
      data: {
        consultationId,
        senderId: userId,
        senderType: userType,
        content,
        messageType,
      },
    });

    // Broadcast to the room
    this.server.to(consultationId).emit('message', message);

    return message;
  }
}
