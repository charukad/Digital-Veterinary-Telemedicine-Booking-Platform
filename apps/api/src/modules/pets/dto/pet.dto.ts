import {
  IsString,
  IsEnum,
  IsOptional,
  IsDate,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Species, Gender } from '@vetcare/types';

export class CreatePetDto {
  @IsString()
  name: string;

  @IsEnum(Species)
  species: Species;

  @IsString()
  breed: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  microchipId?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergies?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  chronicConditions?: string[];

  @IsString()
  @IsOptional()
  medicalNotes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  currentMedications?: string[];
}

export class UpdatePetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  microchipId?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergies?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  chronicConditions?: string[];

  @IsString()
  @IsOptional()
  medicalNotes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  currentMedications?: string[];
}
