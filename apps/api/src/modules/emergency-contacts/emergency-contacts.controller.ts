import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EmergencyContactsService } from './emergency-contacts.service';
import {
  CreateEmergencyContactDto,
  UpdateEmergencyContactDto,
} from './dto/emergency-contact.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('emergency-contacts')
@UseGuards(JwtAuthGuard)
export class EmergencyContactsController {
  constructor(private readonly emergencyContactsService: EmergencyContactsService) {}

  @Post()
  create(@Req() req, @Body() createDto: CreateEmergencyContactDto) {
    return this.emergencyContactsService.create(req.user.userId, createDto);
  }

  @Get()
  findAll(@Req() req) {
    return this.emergencyContactsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.emergencyContactsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Req() req, @Body() updateDto: UpdateEmergencyContactDto) {
    return this.emergencyContactsService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.emergencyContactsService.remove(id, req.user.userId);
  }
}
