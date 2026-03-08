import { IsOptional, IsEnum, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum ReviewSortBy {
  NEWEST = 'newest',
  HIGHEST = 'highest',
  LOWEST = 'lowest',
  MOST_HELPFUL = 'most_helpful',
}

export class ReviewFilterDto {
  @ApiProperty({ required: false, enum: ReviewSortBy })
  @IsOptional()
  @IsEnum(ReviewSortBy)
  sortBy?: ReviewSortBy = ReviewSortBy.NEWEST;

  @ApiProperty({ required: false, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  minRating?: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  maxRating?: number;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;
}

export class ReportReviewDto {
  @ApiProperty({
    description: 'Reason for reporting the review',
    example: 'Inappropriate content',
  })
  @IsString()
  reason: string;
}
