import { Module } from '@nestjs/common';
import { PetInsuranceController } from './pet-insurance.controller';
import { PetInsuranceService } from './pet-insurance.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PetInsuranceController],
  providers: [PetInsuranceService],
  exports: [PetInsuranceService],
})
export class PetInsuranceModule {}
