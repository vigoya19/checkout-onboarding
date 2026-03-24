import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type CheckoutConfig = {
  baseFeeInCents: number;
  deliveryFeeInCents: number;
};

const DEFAULT_BASE_FEE_IN_CENTS = 390_000;
const DEFAULT_DELIVERY_FEE_IN_CENTS = 990_000;

@Injectable()
export class GetCheckoutConfigUseCase {
  constructor(private readonly configService: ConfigService) {}

  execute(): CheckoutConfig {
    return {
      baseFeeInCents:
        this.configService.get<number>('CHECKOUT_BASE_FEE_IN_CENTS') ??
        DEFAULT_BASE_FEE_IN_CENTS,
      deliveryFeeInCents:
        this.configService.get<number>('CHECKOUT_DELIVERY_FEE_IN_CENTS') ??
        DEFAULT_DELIVERY_FEE_IN_CENTS,
    };
  }
}
