import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { OwnerDashboardService } from './owner-dashboard.service';
import { CreatePetDto, UpdatePetDto } from './dto/pet.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('pets')
@UseGuards(JwtAuthGuard)
export class PetsController {
  constructor(
    private readonly petsService: PetsService,
    private readonly ownerDashboardService: OwnerDashboardService,
  ) {}

  @Get('dashboard')
  getOwnerDashboard(@Req() req) {
    return this.ownerDashboardService.getDashboardStats(req.user.userId);
  }

  @Post()
  create(@Req() req, @Body() createPetDto: CreatePetDto) {
    return this.petsService.create(req.user.userId, createPetDto);
  }

  @Get()
  findAll(@Req() req) {
    return this.petsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.petsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updatePetDto: UpdatePetDto,
  ) {
    return this.petsService.update(id, req.user.userId, updatePetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.petsService.remove(id, req.user.userId);
  }
}
