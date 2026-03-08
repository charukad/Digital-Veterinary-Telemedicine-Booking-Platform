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
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto/medical-record.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('medical-records')
@UseGuards(JwtAuthGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  create(@Req() req, @Body() createDto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(req.user.userId, createDto);
  }

  @Get()
  findAll(@Req() req, @Query('petId') petId?: string) {
    return this.medicalRecordsService.findAll(req.user.userId, req.user.role, petId);
  }

  @Get('pet/:petId')
  findByPet(@Param('petId') petId: string, @Req() req) {
    return this.medicalRecordsService.findByPet(petId, req.user.userId, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.medicalRecordsService.findOne(id, req.user.userId, req.user.role);
  }

  @Put(':id')
  update(@Param('id') id: string, @Req() req, @Body() updateDto: UpdateMedicalRecordDto) {
    return this.medicalRecordsService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.medicalRecordsService.remove(id, req.user.userId);
  }
}
