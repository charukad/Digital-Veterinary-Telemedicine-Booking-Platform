import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../notifications/email.service';
import { createHash } from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private merchantId: string;
  private merchantSecret: string;
  private mode: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {
    this.merchantId = this.configService.get<string>('PAYHERE_MERCHANT_ID', '');
    this.merchantSecret = this.configService.get<string>('PAYHERE_MERCHANT_SECRET', '');
    this.mode = this.configService.get<string>('PAYHERE_MODE', 'sandbox');
  }

  async initiatePayment(appointmentId: string, userId: string) {
    // Get appointment with owner and vet details
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
        veterinarian: {
          include: {
            user: true,
          },
        },
        pet: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Verify user owns this appointment
    if (appointment.owner.userId !== userId) {
      throw new ForbiddenException('You can only pay for your own appointments');
    }

    // Check if already paid
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        appointmentId,
        status: 'COMPLETED',
      },
    });

    if (existingPayment) {
      throw new BadRequestException('Appointment already paid');
    }

    // Determine amount based on appointment type
    let amount: number;
    switch (appointment.type) {
      case 'IN_CLINIC':
        amount = Number(appointment.veterinarian.consultationFeeClinic);
        break;
      case 'HOME_VISIT':
        amount = Number(appointment.veterinarian.consultationFeeHome);
        break;
      case 'TELEMEDICINE':
      case 'EMERGENCY':
        amount = Number(appointment.veterinarian.consultationFeeOnline);
        break;
      default:
        amount = Number(appointment.veterinarian.consultationFeeClinic);
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        appointmentId,
        userId,
        amount,
        currency: 'LKR',
        status: 'PENDING',
        paymentMethod: 'PAYHERE_CARD',
        gatewayResponse: {
          appointmentType: appointment.type,
          petName: appointment.pet.name,
        },
      },
    });

    // Generate PayHere hash
    const orderId = payment.id;
    const amountFormatted = amount.toFixed(2);
    const currency = 'LKR';

    const hash = this.generatePaymentHash(orderId, amountFormatted, currency);

    // Return payment data for frontend
    return {
      paymentId: payment.id,
      merchantId: this.merchantId,
      orderId,
      amount: amountFormatted,
      currency,
      hash,
      items: `Veterinary Consultation - ${appointment.pet.name}`,
      firstName: appointment.owner.firstName || 'Pet',
      lastName: appointment.owner.lastName || 'Owner',
      email: appointment.owner.user.email,
      phone: appointment.owner.user.phone || '0000000000',
      address: 'Sri Lanka',
      city: 'Colombo',
      country: 'Sri Lanka',
      returnUrl: this.configService.get('PAYHERE_RETURN_URL'),
      cancelUrl: this.configService.get('PAYHERE_CANCEL_URL'),
      notifyUrl: this.configService.get('PAYHERE_NOTIFY_URL'),
      mode: this.mode,
    };
  }

  async handleWebhook(webhookData: any) {
    this.logger.log('Received PayHere webhook', webhookData);

    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      method,
      status_message,
      card_holder_name,
      card_no,
    } = webhookData;

    // Verify signature
    const isValid = this.verifyWebhookSignature(
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    );

    if (!isValid) {
      this.logger.error('Invalid webhook signature');
      throw new BadRequestException('Invalid signature');
    }

    // Find payment
    const payment = await this.prisma.payment.findUnique({
      where: { id: order_id },
      include: {
        appointment: {
          include: {
            owner: {
              include: {
                user: true,
              },
            },
            veterinarian: true,
            pet: true,
          },
        },
      },
    });

    if (!payment) {
      this.logger.error(`Payment not found: ${order_id}`);
      throw new NotFoundException('Payment not found');
    }

    // Update payment based on status code
    // 2 = Success, 0 = Pending, -1 = Cancelled, -2 = Failed, -3 = Chargedback
    let paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    let appointmentStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED';

    if (status_code === '2') {
      paymentStatus = 'COMPLETED';
      appointmentStatus = 'CONFIRMED';
    } else if (status_code === '0') {
      paymentStatus = 'PENDING';
      appointmentStatus = 'PENDING';
    } else {
      paymentStatus = 'FAILED';
      appointmentStatus = 'PENDING';
    }

    // Update payment
    await this.prisma.payment.update({
      where: { id: order_id },
      data: {
        status: paymentStatus,
        transactionId: payment_id,
        gatewayResponse: {
          ...((payment.gatewayResponse as any) || {}),
          method,
          statusMessage: status_message,
          cardHolderName: card_holder_name,
          cardNo: card_no,
          statusCode: status_code,
        },
      },
    });

    // Update appointment if payment successful
    if (status_code === '2') {
      await this.prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: appointmentStatus },
      });

      // Send receipt email
      try {
        await this.sendReceiptEmail(payment);
      } catch (error) {
        this.logger.error('Failed to send receipt email', error);
      }
    }

    this.logger.log(`Payment ${order_id} updated to ${paymentStatus}`);

    return { success: true, status: paymentStatus };
  }

  async getPaymentDetails(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        appointment: {
          include: {
            owner: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify access
    if (payment.appointment.owner.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return payment;
  }

  async getUserPayments(userId: string) {
    const petOwner = await this.prisma.petOwner.findUnique({
      where: { userId },
    });

    if (!petOwner) {
      return [];
    }

    return this.prisma.payment.findMany({
      where: {
        appointment: {
          ownerId: petOwner.id,
        },
      },
      include: {
        appointment: {
          include: {
            pet: true,
            veterinarian: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private generatePaymentHash(orderId: string, amount: string, currency: string): string {
    const merchantSecret = this.merchantSecret;
    const merchantId = this.merchantId;

    // Hash format: MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret))
    const secretHash = createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const dataString = merchantId + orderId + amount + currency + secretHash;
    const hash = createHash('md5').update(dataString).digest('hex').toUpperCase();

    return hash;
  }

  private verifyWebhookSignature(
    merchantId: string,
    orderId: string,
    paymentId: string,
    amount: string,
    currency: string,
    statusCode: string,
    receivedHash: string,
  ): boolean {
    const merchantSecret = this.merchantSecret;

    // Hash format: MD5(merchant_id + order_id + payment_id + amount + currency + status_code + MD5(merchant_secret))
    const secretHash = createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const dataString = merchantId + orderId + paymentId + amount + currency + statusCode + secretHash;
    const calculatedHash = createHash('md5').update(dataString).digest('hex').toUpperCase();

    return calculatedHash === receivedHash.toUpperCase();
  }

  private async sendReceiptEmail(payment: any) {
    const { appointment } = payment;

    await this.emailService.sendEmail({
      to: appointment.owner?.user?.email || appointment.user?.email || 'user@example.com',
      subject: '✅ Payment Receipt - VetCare Sri Lanka',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Receipt</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ Payment Successful!</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333; margin: 0 0 20px;">Dear ${appointment.owner?.user?.firstName || 'Pet Owner'},</p>

              <p style="font-size: 16px; color: #333; margin: 0 0 30px;">Your payment has been successfully processed. Here are your transaction details:</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px; color: #666;"><strong>Transaction ID:</strong> ${payment.transactionId}</p>
                    <p style="margin: 0 0 10px; color: #666;"><strong>Amount Paid:</strong> LKR ${Number(payment.amount).toFixed(2)}</p>
                    <p style="margin: 0 0 10px; color: #666;"><strong>Payment Method:</strong> ${payment.method}</p>
                    <p style="margin: 0 0 10px; color: #666;"><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString()}</p>
                    <p style="margin: 0; color: #666;"><strong>Pet:</strong> ${appointment.pet.name}</p>
                  </td>
                </tr>
              </table>

              <p style="font-size: 16px; color: #333; margin: 0 0 20px;">Your appointment is now confirmed. We look forward to seeing you!</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/appointments/${appointment.id}"
                   style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  View Appointment
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>VetCare Sri Lanka</strong><br>
                Professional Veterinary Care
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });
  }
}
