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
import { ClinicsService } from './clinics.service';
import { CreateClinicDto, UpdateClinicDto } from './dto/clinic.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req, @Body() createDto: CreateClinicDto) {
    return this.clinicsService.create(req.user.userId, createDto);
  }

  @Get()
  findAll(@Query('city') city?: string, @Query('search') search?: string) {
    return this.clinicsService.findAll(city, search);
  }

  @Get('my-clinics')
  @UseGuards(JwtAuthGuard)
  getMyClinics(@Req() req) {
    return this.clinicsService.getMyClinics(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clinicsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Req() req, @Body() updateDto: UpdateClinicDto) {
    return this.clinicsService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req) {
    return this.clinicsService.remove(id, req.user.userId);
  }
}
