import { Module } from '@nestjs/common';
import { PetsService } from './pets.service';
import { PetsController } from './pets.controller';
import { OwnerDashboardService } from './owner-dashboard.service';

@Module({
  controllers: [PetsController],
  providers: [PetsService, OwnerDashboardService],
  exports: [PetsService],
})
export class PetsModule {}
