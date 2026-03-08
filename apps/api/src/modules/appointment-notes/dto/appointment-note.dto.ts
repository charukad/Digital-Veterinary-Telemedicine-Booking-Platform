import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateAppointmentNoteDto {
  @IsUUID()
  @IsNotEmpty()
  appointmentId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean; // Private notes only visible to vet

  @IsString()
  @IsOptional()
  @MaxLength(50)
  noteType?: string; // e.g., 'OBSERVATION', 'INSTRUCTION', 'FOLLOW_UP'
}

export class UpdateAppointmentNoteDto extends PartialType(CreateAppointmentNoteDto) {}
