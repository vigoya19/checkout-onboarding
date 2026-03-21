import { IsEmail, IsInt, IsString, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  productId!: string;

  @IsEmail()
  customerEmail!: string;

  @IsInt()
  @Min(1)
  amountInCents!: number;

  @IsInt()
  @Min(0)
  baseFeeInCents!: number;

  @IsInt()
  @Min(0)
  deliveryFeeInCents!: number;
}
