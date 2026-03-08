import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateVaccinationDto {
  @IsNotEmpty()
  @IsString()
  petId: string;

  @IsNotEmpty()
  @IsString()
  vaccineName: string;

  @IsNotEmpty()
  @IsDateString()
  dateAdministered: string;

  @IsOptional()
  @IsDateString()
  nextDueDate?: string;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateVaccinationDto {
  @IsOptional()
  @IsString()
  vaccineName?: string;

  @IsOptional()
  @IsDateString()
  dateAdministered?: string;

  @IsOptional()
  @IsDateString()
  nextDueDate?: string;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
