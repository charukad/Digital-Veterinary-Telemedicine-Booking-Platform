import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateLabResultDto {
  @IsUUID()
  @IsNotEmpty()
  medicalRecordId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  testName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  testType: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  results?: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateLabResultDto extends PartialType(CreateLabResultDto) {}
