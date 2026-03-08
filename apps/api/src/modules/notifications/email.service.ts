import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private fromEmail: string;
  private fromName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not found. Email notifications will be disabled.');
    } else {
      this.resend = new Resend(apiKey);
    }

    this.fromEmail = this.configService.get<string>('EMAIL_FROM', 'noreply@vetcare.lk');
    this.fromName = this.configService.get<string>('EMAIL_FROM_NAME', 'VetCare Sri Lanka');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.resend) {
      this.logger.warn('Email service not configured. Skipping email send.');
      return false;
    }

    try {
      const from = options.from || `${this.fromName} <${this.fromEmail}>`;

      const { data, error } = await this.resend.emails.send({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        this.logger.error(`Failed to send email: ${error.message}`, error);
        return false;
      }

      this.logger.log(`Email sent successfully to ${options.to} - ID: ${data?.id}`);
      return true;
    } catch (error) {
      this.logger.error('Error sending email:', error);
      return false;
    }
  }

  async sendBookingConfirmation(data: {
    to: string;
    ownerName: string;
    petName: string;
    vetName: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentType: string;
    clinicName?: string;
    clinicAddress?: string;
  }): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ Appointment Confirmed!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333; margin: 0 0 20px;">Dear ${data.ownerName},</p>

              <p style="font-size: 16px; color: #333; margin: 0 0 30px;">Your appointment has been successfully confirmed. Here are the details:</p>

              <!-- Appointment Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;"><strong>Pet:</strong> ${data.petName}</p>
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;"><strong>Veterinarian:</strong> ${data.vetName}</p>
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;"><strong>Date:</strong> ${data.appointmentDate}</p>
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;"><strong>Time:</strong> ${data.appointmentTime}</p>
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;"><strong>Type:</strong> ${data.appointmentType}</p>
                    ${data.clinicName ? `<p style="margin: 0 0 10px; color: #666; font-size: 14px;"><strong>Clinic:</strong> ${data.clinicName}</p>` : ''}
                    ${data.clinicAddress ? `<p style="margin: 0; color: #666; font-size: 14px;"><strong>Address:</strong> ${data.clinicAddress}</p>` : ''}
                  </td>
                </tr>
              </table>

              <p style="font-size: 16px; color: #333; margin: 0 0 20px;">We'll send you a reminder 24 hours before your appointment.</p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/appointments"
                   style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  View Appointment
                </a>
              </div>

              <p style="font-size: 14px; color: #666; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #eee;">
                If you need to cancel or reschedule, please do so at least 24 hours in advance.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>VetCare Sri Lanka</strong><br>
                Professional Veterinary Care<br>
                <a href="mailto:support@vetcare.lk" style="color: #667eea; text-decoration: none;">support@vetcare.lk</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail({
      to: data.to,
      subject: '✅ Appointment Confirmed - VetCare Sri Lanka',
      html,
    });
  }

  async sendAppointmentReminder(data: {
    to: string;
    ownerName: string;
    petName: string;
    vetName: string;
    appointmentDate: string;
    appointmentTime: string;
    clinicName?: string;
    clinicAddress?: string;
  }): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">⏰ Appointment Tomorrow!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333; margin: 0 0 20px;">Dear ${data.ownerName},</p>

              <p style="font-size: 16px; color: #333; margin: 0 0 30px;">This is a friendly reminder about your upcoming appointment tomorrow:</p>

              <!-- Appointment Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff5f5; border-left: 4px solid #f5576c; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;"><strong>Pet:</strong> ${data.petName}</p>
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;"><strong>Veterinarian:</strong> ${data.vetName}</p>
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;"><strong>Date:</strong> ${data.appointmentDate}</p>
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;"><strong>Time:</strong> ${data.appointmentTime}</p>
                    ${data.clinicName ? `<p style="margin: 0 0 10px; color: #666; font-size: 14px;"><strong>Clinic:</strong> ${data.clinicName}</p>` : ''}
                    ${data.clinicAddress ? `<p style="margin: 0; color: #666; font-size: 14px;"><strong>Address:</strong> ${data.clinicAddress}</p>` : ''}
                  </td>
                </tr>
              </table>

              <p style="font-size: 16px; color: #333; margin: 0 0 10px;"><strong>Before you come:</strong></p>
              <ul style="font-size: 14px; color: #666; margin: 0 0 30px;">
                <li>Bring any previous medical records</li>
                <li>List current medications (if any)</li>
                <li>Arrive 10 minutes early</li>
                <li>Keep your pet calm and comfortable</li>
              </ul>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/appointments"
                   style="display: inline-block; background-color: #f5576c; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  View Details
                </a>
              </div>

              <p style="font-size: 14px; color: #666; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #eee;">
                We look forward to seeing you and ${data.petName}!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>VetCare Sri Lanka</strong><br>
                <a href="mailto:support@vetcare.lk" style="color: #f5576c; text-decoration: none;">support@vetcare.lk</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail({
      to: data.to,
      subject: '⏰ Reminder: Your appointment is tomorrow - VetCare',
      html,
    });
  }

  async sendStatusUpdate(data: {
    to: string;
    ownerName: string;
    petName: string;
    oldStatus: string;
    newStatus: string;
    vetName: string;
  }): Promise<boolean> {
    const statusMessages = {
      CONFIRMED: 'Your appointment has been confirmed by the veterinarian.',
      IN_PROGRESS: 'Your consultation has started.',
      COMPLETED: 'Your appointment has been completed.',
      CANCELLED: 'Your appointment has been cancelled.',
      NO_SHOW: 'This appointment was marked as no-show.',
    };

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Status Updated</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background-color: #4f46e5; padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Appointment Status Updated</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333; margin: 0 0 20px;">Dear ${data.ownerName},</p>

              <p style="font-size: 16px; color: #333; margin: 0 0 30px;">
                ${statusMessages[data.newStatus] || 'Your appointment status has been updated.'}
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px; color: #666;"><strong>Pet:</strong> ${data.petName}</p>
                    <p style="margin: 0 0 10px; color: #666;"><strong>Veterinarian:</strong> ${data.vetName}</p>
                    <p style="margin: 0; color: #666;"><strong>New Status:</strong> <span style="color: #4f46e5; font-weight: bold;">${data.newStatus}</span></p>
                  </td>
                </tr>
              </table>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/appointments"
                   style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px;">
                  View Appointment
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #666;">VetCare Sri Lanka</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail({
      to: data.to,
      subject: 'Appointment Status Updated - VetCare',
      html,
    });
  }
}
