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
import { PetInsuranceService } from './pet-insurance.service';
import {
  CreatePetInsuranceDto,
  UpdatePetInsuranceDto,
} from './dto/pet-insurance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('pet-insurance')
@UseGuards(JwtAuthGuard)
export class PetInsuranceController {
  constructor(private readonly petInsuranceService: PetInsuranceService) {}

  @Post()
  create(@Req() req, @Body() createDto: CreatePetInsuranceDto) {
    return this.petInsuranceService.create(req.user.userId, createDto);
  }

  @Get('pet/:petId')
  findAllByPet(@Param('petId') petId: string, @Req() req) {
    return this.petInsuranceService.findAllByPet(petId, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.petInsuranceService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateDto: UpdatePetInsuranceDto,
  ) {
    return this.petInsuranceService.update(id, req.user.userId, updateDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Req() req,
    @Body('status') status: string,
  ) {
    return this.petInsuranceService.updateStatus(id, req.user.userId, status);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.petInsuranceService.delete(id, req.user.userId);
  }
}
