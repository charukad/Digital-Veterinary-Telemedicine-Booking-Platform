import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class QualificationDto {
  @IsString()
  degree: string;

  @IsString()
  institution: string;

  @IsString()
  year: string;

  @IsString()
  @IsOptional()
  certificateUrl?: string;
}

class SpecializationDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  certificateUrl?: string;
}

export class UpdateVetProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(10)
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  licenseIssuedBy?: string;

  @IsString()
  @IsOptional()
  licenseExpiryDate?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualificationDto)
  @IsOptional()
  qualifications?: QualificationDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecializationDto)
  @IsOptional()
  specializations?: SpecializationDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsString()
  @IsOptional()
  consultationFee?: string;

  @IsString()
  @IsOptional()
  emergencyAvailable?: string;
}

export class CreateClinicDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  services?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  facilities?: string[];
}

export class UpdateClinicDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  services?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  facilities?: string[];
}
