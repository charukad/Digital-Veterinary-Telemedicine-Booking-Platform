import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from './dto/prescription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  create(@Req() req, @Body() createDto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(req.user.userId, createDto);
  }

  @Get('medical-record/:recordId')
  findAllByMedicalRecord(@Param('recordId') recordId: string, @Req() req) {
    return this.prescriptionsService.findAllByMedicalRecord(recordId, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.prescriptionsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateDto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionsService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.prescriptionsService.delete(id, req.user.userId);
  }
}
