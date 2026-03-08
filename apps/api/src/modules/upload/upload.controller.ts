import {
  Controller,
  Post,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('profile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.uploadService.uploadImage(file, 'profiles/users');
    return result;
  }

  @Post('vet-profile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVetProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.uploadService.uploadImage(file, 'profiles/vets');
    return result;
  }

  @Post('pet')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPetImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.uploadService.uploadImage(file, 'pets');
    return result;
  }

  @Post('certificate')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCertificate(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.uploadService.uploadImage(file, 'certificates');
    return result;
  }

  @Delete(':publicId')
  async deleteImage(@Param('publicId') publicId: string, @Req() req) {
    // Decode the public ID (it comes URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);
    const success = await this.uploadService.deleteImage(decodedPublicId);

    return {
      success,
      message: success ? 'Image deleted successfully' : 'Failed to delete image',
    };
  }
}
