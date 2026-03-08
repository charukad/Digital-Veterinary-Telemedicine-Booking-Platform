import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TreatmentPlansService } from './treatment-plans.service';
import {
  CreateTreatmentPlanDto,
  UpdateTreatmentPlanDto,
} from './dto/treatment-plan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('treatment-plans')
@UseGuards(JwtAuthGuard)
export class TreatmentPlansController {
  constructor(private readonly treatmentPlansService: TreatmentPlansService) {}

  @Post()
  create(@Req() req, @Body() createDto: CreateTreatmentPlanDto) {
    return this.treatmentPlansService.create(req.user.userId, createDto);
  }

  @Get('pet/:petId')
  findAllByPet(@Param('petId') petId: string, @Req() req) {
    return this.treatmentPlansService.findAllByPet(
      petId,
      req.user.userId,
      req.user.role,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.treatmentPlansService.findOne(id, req.user.userId, req.user.role);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateDto: UpdateTreatmentPlanDto,
  ) {
    return this.treatmentPlansService.update(id, req.user.userId, updateDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Req() req,
    @Body('status') status: string,
  ) {
    return this.treatmentPlansService.updateStatus(id, req.user.userId, status);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.treatmentPlansService.delete(id, req.user.userId);
  }
}
