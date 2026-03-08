import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailAppointmentReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  emailAppointmentConfirmations?: boolean;

  @IsOptional()
  @IsBoolean()
  emailPaymentReceipts?: boolean;

  @IsOptional()
  @IsBoolean()
  emailPromotions?: boolean;

  @IsOptional()
  @IsBoolean()
  emailSystemUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  smsAppointmentReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  smsPaymentConfirmations?: boolean;
}
