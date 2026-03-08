import { z } from 'zod';
import { UserType, Species, Gender, AppointmentType } from '@vetcare/types';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  userType: z.nativeEnum(UserType),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const petSchema = z.object({
  name: z.string().min(1, 'Pet name is required'),
  species: z.nativeEnum(Species),
  breed: z.string().optional(),
  dateOfBirth: z.string().optional().or(z.date()),
  gender: z.nativeEnum(Gender),
  weight: z.number().optional(),
  color: z.string().optional(),
  microchipId: z.string().optional(),
});

export const appointmentSchema = z.object({
  petId: z.string().uuid('Invalid pet selection'),
  veterinarianId: z.string().uuid('Invalid veterinarian selection'),
  clinicId: z.string().uuid().optional(),
  type: z.nativeEnum(AppointmentType),
  scheduledAt: z.string().or(z.date()),
  durationMinutes: z.number().default(30),
  symptoms: z.string().optional(),
  notes: z.string().optional(),
});
