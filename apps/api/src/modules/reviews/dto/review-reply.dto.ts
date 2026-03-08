import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';

export class CreateReviewReplyDto {
  @IsNotEmpty()
  @IsString()
  reply: string;
}

export class UpdateReviewDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  @IsString()
  comment: string;
}
