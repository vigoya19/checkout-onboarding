import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type CheckoutConfig = {
  baseFeeInCents: number;
  deliveryFeeInCents: number;
};

const DEFAULT_BASE_FEE_IN_CENTS = 390_000;
const DEFAULT_DELIVERY_FEE_IN_CENTS = 990_000;

function resolveFeeInCents(value: unknown, fallback: number) {
  const normalizedValue =
    typeof value === 'string' ? Number.parseInt(value, 10) : value;

  return typeof normalizedValue === 'number' &&
    Number.isFinite(normalizedValue) &&
    normalizedValue >= 0
    ? normalizedValue
    : fallback;
}

@Injectable()
export class GetCheckoutConfigUseCase {
  constructor(private readonly configService: ConfigService) {}

  execute(): CheckoutConfig {
    return {
      baseFeeInCents: resolveFeeInCents(
        this.configService.get<number | string>('CHECKOUT_BASE_FEE_IN_CENTS'),
        DEFAULT_BASE_FEE_IN_CENTS,
      ),
      deliveryFeeInCents: resolveFeeInCents(
        this.configService.get<number | string>(
          'CHECKOUT_DELIVERY_FEE_IN_CENTS',
        ),
        DEFAULT_DELIVERY_FEE_IN_CENTS,
      ),
    };
  }
}
