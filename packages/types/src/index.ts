export enum UserType {
  PET_OWNER = 'PET_OWNER',
  VETERINARIAN = 'VETERINARIAN',
  CLINIC_ADMIN = 'CLINIC_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNKNOWN = 'UNKNOWN',
}

export enum Species {
  DOG = 'DOG',
  CAT = 'CAT',
  BIRD = 'BIRD',
  RABBIT = 'RABBIT',
  HAMSTER = 'HAMSTER',
  GUINEA_PIG = 'GUINEA_PIG',
  TURTLE = 'TURTLE',
  FISH = 'FISH',
  OTHER = 'OTHER',
}

export enum AppointmentType {
  IN_CLINIC = 'IN_CLINIC',
  HOME_VISIT = 'HOME_VISIT',
  TELEMEDICINE = 'TELEMEDICINE',
  EMERGENCY = 'EMERGENCY',
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  PAYHERE_CARD = 'PAYHERE_CARD',
  PAYHERE_BANK = 'PAYHERE_BANK',
  EZPAY = 'EZPAY',
  GENIE = 'GENIE',
  WALLET = 'WALLET',
}

export enum Language {
  ENGLISH = 'ENGLISH',
  SINHALA = 'SINHALA',
  TAMIL = 'TAMIL',
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  userType: UserType;
  status: UserStatus;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: Species;
  breed?: string;
  dateOfBirth?: Date;
  gender: Gender;
  weight?: number;
  color?: string;
  microchipId?: string;
  profileImage?: string;
}

export interface Appointment {
  id: string;
  petId: string;
  veterinarianId: string;
  clinicId?: string;
  ownerId: string;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduledAt: Date;
  durationMinutes: number;
  symptoms?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
