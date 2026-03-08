import { Module } from '@nestjs/common';
import { VeterinariansService } from './veterinarians.service';
import { VeterinariansController } from './veterinarians.controller';
import { VetDashboardService } from './vet-dashboard.service';

@Module({
  controllers: [VeterinariansController],
  providers: [VeterinariansService, VetDashboardService],
  exports: [VeterinariansService, VetDashboardService],
})
export class VeterinariansModule {}
