import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class ProcessRefundDto {
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  refundAmount?: number; // If not provided, full refund

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  refundMethod?: string; // 'ORIGINAL_METHOD', 'WALLET', 'BANK_TRANSFER'
}
