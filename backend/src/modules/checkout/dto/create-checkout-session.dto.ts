import { IsEmail, IsInt, IsString, Max, Min } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  @Max(4)
  currentStep!: number;

  @IsEmail()
  customerEmail!: string;
}
