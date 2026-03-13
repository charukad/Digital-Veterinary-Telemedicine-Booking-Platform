import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

export class TreatmentStepDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  medication?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  dosage?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  frequency?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  instructions?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;
}

export class CreateTreatmentPlanDto {
  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @IsUUID()
  @IsOptional()
  medicalRecordId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  diagnosis: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreatmentStepDto)
  @IsOptional()
  steps?: TreatmentStepDto[];

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateTreatmentPlanDto extends PartialType(CreateTreatmentPlanDto) { }
