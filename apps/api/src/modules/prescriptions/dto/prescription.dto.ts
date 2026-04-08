import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreatePrescriptionDto {
  @IsUUID()
  @IsNotEmpty()
  medicalRecordId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  medicationName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  dosage: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  frequency: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  duration: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  instructions?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}

export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {}
