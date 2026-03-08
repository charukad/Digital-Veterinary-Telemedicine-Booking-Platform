import { IsString, IsOptional } from 'class-validator';

export class PayHereWebhookDto {
  @IsString()
  merchant_id: string;

  @IsString()
  order_id: string;

  @IsString()
  payment_id: string;

  @IsString()
  payhere_amount: string;

  @IsString()
  payhere_currency: string;

  @IsString()
  status_code: string;

  @IsString()
  md5sig: string;

  @IsOptional()
  @IsString()
  custom_1?: string;

  @IsOptional()
  @IsString()
  custom_2?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  status_message?: string;

  @IsOptional()
  @IsString()
  card_holder_name?: string;

  @IsOptional()
  @IsString()
  card_no?: string;
}
