import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ProcessTransactionPaymentDto {
  @IsString()
  cardToken!: string;

  @IsString()
  acceptanceToken!: string;

  @IsString()
  @IsOptional()
  acceptPersonalAuthToken?: string;

  @IsString()
  @IsOptional()
  customerIp?: string;

  @IsInt()
  @Min(1)
  @Max(36)
  installments!: number;
}
