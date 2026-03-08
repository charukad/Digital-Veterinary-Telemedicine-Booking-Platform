import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { VeterinariansService } from './veterinarians.service';
import { VetDashboardService } from './vet-dashboard.service';
import { UpdateVetProfileDto } from './dto/veterinarian.dto';
import {
  CreateAvailabilitySlotDto,
  UpdateAvailabilitySlotDto,
  BulkAvailabilityDto,
} from './dto/availability.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('veterinarians')
export class VeterinariansController {
  constructor(
    private readonly veterinariansService: VeterinariansService,
    private readonly vetDashboardService: VetDashboardService,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@Req() req) {
    return this.veterinariansService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req, @Body() updateDto: UpdateVetProfileDto) {
    return this.veterinariansService.updateProfile(req.user.userId, updateDto);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  getDashboard(@Req() req) {
    return this.vetDashboardService.getDashboardStats(req.user.userId);
  }

  @Get('dashboard/today')
  @UseGuards(JwtAuthGuard)
  getTodaysSchedule(@Req() req) {
    return this.vetDashboardService.getTodaysSchedule(req.user.userId);
  }

  @Get()
  getAllVeterinarians(
    @Query('query') query?: string,
    @Query('city') city?: string,
    @Query('specialization') specialization?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minRating') minRating?: string,
    @Query('sort') sort?: string,
  ) {
    return this.veterinariansService.searchVeterinarians({
      query,
      city,
      specialization,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      sort,
    });
  }

  @Get(':id')
  getVeterinarianById(@Param('id') id: string) {
    return this.veterinariansService.getVeterinarianById(id);
  }

  // Availability Management
  @Get('availability/me')
  @UseGuards(JwtAuthGuard)
  getMyAvailability(@Req() req) {
    return this.veterinariansService.getAvailability(req.user.userId);
  }

  @Post('availability')
  @UseGuards(JwtAuthGuard)
  setAvailability(@Req() req, @Body() dto: BulkAvailabilityDto) {
    return this.veterinariansService.setAvailability(req.user.userId, dto.slots);
  }

  @Patch('availability/:slotId')
  @UseGuards(JwtAuthGuard)
  updateSlot(
    @Req() req,
    @Param('slotId') slotId: string,
    @Body() dto: UpdateAvailabilitySlotDto,
  ) {
    return this.veterinariansService.updateSlot(req.user.userId, slotId, dto);
  }

  @Delete('availability/:slotId')
  @UseGuards(JwtAuthGuard)
  deleteSlot(@Req() req, @Param('slotId') slotId: string) {
    return this.veterinariansService.deleteSlot(req.user.userId, slotId);
  }

  @Get(':id/available-slots')
  getAvailableSlots(@Param('id') id: string, @Query('date') date: string) {
    return this.veterinariansService.getAvailableSlots(id, date);
  }
}
