import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePetInsuranceDto {
  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  provider: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  policyNumber: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  coverageAmount?: number;

  @IsNumber()
  @IsOptional()
  deductible?: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  coverageDetails?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}

export class UpdatePetInsuranceDto extends PartialType(CreatePetInsuranceDto) {}
