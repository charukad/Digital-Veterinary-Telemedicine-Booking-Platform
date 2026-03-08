import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { AppointmentType, AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @IsString()
  petId: string;

  @IsString()
  veterinarianId: string;

  @IsString()
  @IsOptional()
  clinicId?: string;

  @IsEnum(AppointmentType)
  type: AppointmentType;

  @IsDateString()
  scheduledAt: string;

  @IsInt()
  @Min(15)
  @IsOptional()
  durationMinutes?: number;

  @IsString()
  @IsOptional()
  symptoms?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAppointmentDto {
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsInt()
  @Min(15)
  @IsOptional()
  durationMinutes?: number;

  @IsString()
  @IsOptional()
  symptoms?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
