import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  create(@Req() req, @Body() createDto: CreateAddressDto) {
    return this.addressesService.create(req.user.userId, createDto);
  }

  @Get()
  findAll(@Req() req) {
    return this.addressesService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.addressesService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Req() req, @Body() updateDto: UpdateAddressDto) {
    return this.addressesService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.addressesService.remove(id, req.user.userId);
  }

  @Patch(':id/set-default')
  setDefault(@Param('id') id: string, @Req() req) {
    return this.addressesService.setDefault(id, req.user.userId);
  }
}
