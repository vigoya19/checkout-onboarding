import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WompiWebhookTransactionDto {
  @IsString()
  id!: string;

  @IsInt()
  amount_in_cents!: number;

  @IsString()
  reference!: string;

  @IsString()
  customer_email!: string;

  @IsString()
  currency!: string;

  @IsString()
  @IsOptional()
  payment_method_type?: string;

  @IsString()
  status!: string;
}

export class WompiWebhookDataDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => WompiWebhookTransactionDto)
  @IsOptional()
  transaction?: WompiWebhookTransactionDto;
}

export class WompiWebhookSignatureDto {
  @IsArray()
  properties!: string[];

  @IsString()
  checksum!: string;
}

export class WompiWebhookDto {
  @IsString()
  event!: string;

  @ValidateNested()
  @Type(() => WompiWebhookDataDto)
  data!: WompiWebhookDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WompiWebhookSignatureDto)
  signature?: WompiWebhookSignatureDto;

  @IsInt()
  @IsOptional()
  timestamp?: number;
}
