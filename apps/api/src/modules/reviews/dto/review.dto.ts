import { IsInt, IsString, IsOptional, Min, Max, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  veterinarianId: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  comment?: string;
}

export class UpdateReviewDto {
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  comment?: string;
}
