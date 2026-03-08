import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class RescheduleAppointmentDto {
  @IsDateString()
  @IsNotEmpty()
  newDate: string;

  @IsString()
  @IsNotEmpty()
  newStartTime: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
