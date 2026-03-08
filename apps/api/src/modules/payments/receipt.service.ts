import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

@Injectable()
export class ReceiptService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a unique receipt number
   */
  private generateReceiptNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `RCT-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Generate PDF receipt for a payment
   */
  async generateReceipt(paymentId: string): Promise<Buffer> {
    // Fetch payment details with related data
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        appointment: {
          include: {
            pet: true,
            veterinarian: {
              include: {
                user: true,
              },
            },
            owner: {
              include: {
                user: true,
              },
            },
          },
        },
        user: true,
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return this.createPDFReceipt(payment);
  }

  /**
   * Create PDF document for receipt
   */
  private async createPDFReceipt(payment: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      // Collect PDF data
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const receiptNumber = this.generateReceiptNumber();

      // Header
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('PAYMENT RECEIPT', { align: 'center' })
        .moveDown(0.5);

      // Company Details
      doc
        .fontSize(12)
        .font('Helvetica')
        .text('VetCare Sri Lanka', { align: 'center' })
        .text('Veterinary Care Platform', { align: 'center' })
        .text('support@vetcare.lk | +94 11 234 5678', { align: 'center' })
        .moveDown(1);

      // Receipt Number and Date
      doc
        .fontSize(10)
        .text(`Receipt #: ${receiptNumber}`, 50, doc.y)
        .text(`Date: ${new Date(payment.paidAt || payment.createdAt).toLocaleString()}`, { align: 'right' })
        .moveDown();

      // Divider
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

      // Customer Information
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Bill To:', 50, doc.y)
        .font('Helvetica')
        .fontSize(10)
        .text(`${payment.appointment.owner.firstName} ${payment.appointment.owner.lastName}`)
        .text(payment.user.email)
        .moveDown();

      // Pet Information
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Pet Details:', 50, doc.y)
        .font('Helvetica')
        .fontSize(10)
        .text(`Name: ${payment.appointment.pet.name}`)
        .text(`Species: ${payment.appointment.pet.species}`)
        .text(`Breed: ${payment.appointment.pet.breed || 'N/A'}`)
        .moveDown();

      // Veterinarian Information
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Consulted By:', 50, doc.y)
        .font('Helvetica')
        .fontSize(10)
        .text(`Dr. ${payment.appointment.veterinarian.user.email}`)
        .text(`License: ${payment.appointment.veterinarian.licenseNumber}`)
        .moveDown();

      // Appointment Details
      doc.moveDown().moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Appointment Information:', 50, doc.y)
        .font('Helvetica')
        .fontSize(10)
        .text(`Date & Time: ${new Date(payment.appointment.scheduledAt).toLocaleString()}`)
        .text(`Type: ${payment.appointment.type}`)
        .text(`Duration: ${payment.appointment.durationMinutes} minutes`)
        .moveDown(2);

      // Payment Details Table
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);

      const tableTop = doc.y;
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Description', 50, tableTop)
        .text('Amount', 350, tableTop, { width: 200, align: 'right' });

      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke().moveDown(0.5);

      // Payment items
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`${payment.appointment.type} Consultation`, 50, doc.y)
        .text(`LKR ${parseFloat(payment.amount.toString()).toFixed(2)}`, 350, doc.y, { width: 200, align: 'right' })
        .moveDown();

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);

      // Total
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Total Amount:', 50, doc.y)
        .text(`LKR ${parseFloat(payment.amount.toString()).toFixed(2)}`, 350, doc.y, { width: 200, align: 'right' })
        .moveDown();

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

      // Payment Information
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Payment Method: ${payment.paymentMethod}`, 50, doc.y)
        .text(`Transaction ID: ${payment.transactionId || 'N/A'}`)
        .text(`Status: ${payment.status}`)
        .moveDown(2);

      // Footer
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

      doc
        .fontSize(8)
        .font('Helvetica')
        .text('Thank you for choosing VetCare!', { align: 'center' })
        .text('This is a computer-generated receipt and does not require a signature.', { align: 'center' })
        .moveDown(0.5)
        .text('For inquiries, please contact support@vetcare.lk', { align: 'center' });

      // Finalize PDF
      doc.end();
    });
  }

  /**
   * Get receipt as stream (for direct download)
   */
  async getReceiptStream(paymentId: string): Promise<Readable> {
    const buffer = await this.generateReceipt(paymentId);
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  /**
   * Generate receipt filename
   */
  generateReceiptFilename(paymentId: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `receipt-${paymentId}-${timestamp}.pdf`;
  }
}
