import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PetsModule } from './modules/pets/pets.module';
import { VeterinariansModule } from './modules/veterinarians/veterinarians.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { VaccinationsModule } from './modules/vaccinations/vaccinations.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { LabResultsModule } from './modules/lab-results/lab-results.module';
import { TreatmentPlansModule } from './modules/treatment-plans/treatment-plans.module';
import { AppointmentNotesModule } from './modules/appointment-notes/appointment-notes.module';
import { ClinicsModule } from './modules/clinics/clinics.module';
import { EmergencyContactsModule } from './modules/emergency-contacts/emergency-contacts.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { PetInsuranceModule } from './modules/pet-insurance/pet-insurance.module';
import { TelemedicineModule } from './modules/telemedicine/telemedicine.module';
import { ChatModule } from './modules/chat/chat.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    PetsModule,
    VeterinariansModule,
    AppointmentsModule,
    MedicalRecordsModule,
    VaccinationsModule,
    PrescriptionsModule,
    PaymentsModule,
    ReviewsModule,
    NotificationsModule,
    LabResultsModule,
    TreatmentPlansModule,
    AppointmentNotesModule,
    ClinicsModule,
    EmergencyContactsModule,
    AddressesModule,
    PetInsuranceModule,
    TelemedicineModule,
    ChatModule,
    HealthModule,
  ],
})
export class AppModule {}
