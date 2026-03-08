import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VaccinationsService } from './vaccinations.service';
import { CreateVaccinationDto, UpdateVaccinationDto } from './dto/vaccination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('vaccinations')
@UseGuards(JwtAuthGuard)
export class VaccinationsController {
  constructor(private readonly vaccinationsService: VaccinationsService) {}

  @Post()
  create(@Req() req, @Body() createDto: CreateVaccinationDto) {
    return this.vaccinationsService.create(req.user.userId, createDto);
  }

  @Get()
  findAll(@Req() req, @Query('petId') petId?: string) {
    return this.vaccinationsService.findAll(req.user.userId, req.user.role, petId);
  }

  @Get('upcoming')
  getUpcoming(@Req() req, @Query('days') days?: string) {
    const daysNum = days ? parseInt(days) : 30;
    return this.vaccinationsService.getUpcoming(req.user.userId, req.user.role, daysNum);
  }

  @Get('pet/:petId')
  findByPet(@Param('petId') petId: string, @Req() req) {
    return this.vaccinationsService.findByPet(petId, req.user.userId, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.vaccinationsService.findOne(id, req.user.userId, req.user.role);
  }

  @Put(':id')
  update(@Param('id') id: string, @Req() req, @Body() updateDto: UpdateVaccinationDto) {
    return this.vaccinationsService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.vaccinationsService.remove(id, req.user.userId);
  }
}
