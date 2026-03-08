import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cloudinary from 'cloudinary';

@Injectable()
export class ImageOptimizationService {
  constructor(private configService: ConfigService) {}

  /**
   * Optimize image URL with Cloudinary transformations
   */
  optimizeImageUrl(
    imageUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: 'auto' | number;
      format?: 'auto' | 'webp' | 'jpg' | 'png';
      crop?: 'fill' | 'fit' | 'scale';
    } = {},
  ): string {
    // If not a Cloudinary URL, return as-is
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      return imageUrl;
    }

    const {
      width = 800,
      height,
      quality = 'auto',
      format = 'auto',
      crop = 'fill',
    } = options;

    // Extract public ID from Cloudinary URL
    const parts = imageUrl.split('/upload/');
    if (parts.length !== 2) return imageUrl;

    const [baseUrl, pathWithPublicId] = parts;

    // Build transformation string
    const transformations = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);

    const transformString = transformations.join(',');

    return `${baseUrl}/upload/${transformString}/${pathWithPublicId}`;
  }

  /**
   * Get responsive image URLs for different screen sizes
   */
  getResponsiveImageUrls(imageUrl: string): {
    thumbnail: string;
    mobile: string;
    tablet: string;
    desktop: string;
    original: string;
  } {
    return {
      thumbnail: this.optimizeImageUrl(imageUrl, {
        width: 150,
        height: 150,
        quality: 'auto',
        format: 'webp',
      }),
      mobile: this.optimizeImageUrl(imageUrl, {
        width: 640,
        quality: 'auto',
        format: 'webp',
      }),
      tablet: this.optimizeImageUrl(imageUrl, {
        width: 1024,
        quality: 'auto',
        format: 'webp',
      }),
      desktop: this.optimizeImageUrl(imageUrl, {
        width: 1920,
        quality: 80,
        format: 'webp',
      }),
      original: imageUrl,
    };
  }

  /**
   * Compress and optimize before upload
   */
  getUploadPreset(): string {
    return 'vetcare_optimized';
  }
}
