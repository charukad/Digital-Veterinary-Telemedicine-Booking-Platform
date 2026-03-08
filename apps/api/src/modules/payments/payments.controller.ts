import { Controller, Post, Get, Param, Body, Req, UseGuards, Res, StreamableFile } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PayHereWebhookDto } from './dto/payment.dto';
import { ReceiptService } from './receipt.service';
import { Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly receiptService: ReceiptService,
  ) {}

  @Post('initiate/:appointmentId')
  @UseGuards(JwtAuthGuard)
  async initiatePayment(@Param('appointmentId') appointmentId: string, @Req() req) {
    return this.paymentsService.initiatePayment(appointmentId, req.user.userId);
  }

  @Post('webhook')
  async handleWebhook(@Body() webhookData: PayHereWebhookDto) {
    return this.paymentsService.handleWebhook(webhookData);
  }

  @Get(':id/receipt')
  @UseGuards(JwtAuthGuard)
  async downloadReceipt(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.receiptService.generateReceipt(id);
    const filename = this.receiptService.generateReceiptFilename(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }

  @Get(':id/receipt/preview')
  @UseGuards(JwtAuthGuard)
  async previewReceipt(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.receiptService.generateReceipt(id);
    const filename = this.receiptService.generateReceiptFilename(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPaymentDetails(@Param('id') id: string, @Req() req) {
    return this.paymentsService.getPaymentDetails(id, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserPayments(@Req() req) {
    return this.paymentsService.getUserPayments(req.user.userId);
  }
}
