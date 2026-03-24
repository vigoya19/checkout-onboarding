import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class AskAssistantDto {
  @IsString()
  @MaxLength(500)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  productId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  productName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  productDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  currentStep?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceInCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  baseFeeInCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  deliveryFeeInCents?: number;

  @IsOptional()
  @IsIn(['COP'])
  currency?: 'COP';
}
