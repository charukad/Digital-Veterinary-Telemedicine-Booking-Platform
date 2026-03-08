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
import { LabResultsService } from './lab-results.service';
import { CreateLabResultDto, UpdateLabResultDto } from './dto/lab-result.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('lab-results')
@UseGuards(JwtAuthGuard)
export class LabResultsController {
  constructor(private readonly labResultsService: LabResultsService) {}

  @Post()
  create(@Req() req, @Body() createDto: CreateLabResultDto) {
    return this.labResultsService.create(req.user.userId, createDto);
  }

  @Get('medical-record/:recordId')
  findAllByMedicalRecord(@Param('recordId') recordId: string, @Req() req) {
    return this.labResultsService.findAllByMedicalRecord(recordId, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.labResultsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateDto: UpdateLabResultDto,
  ) {
    return this.labResultsService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.labResultsService.delete(id, req.user.userId);
  }
}
