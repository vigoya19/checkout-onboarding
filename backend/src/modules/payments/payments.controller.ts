import { Controller, Get } from '@nestjs/common';
import { GetCheckoutConfigUseCase } from './application/use-cases/get-checkout-config.use-case';
import { GetAcceptanceTokensUseCase } from './application/use-cases/get-acceptance-tokens.use-case';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly getAcceptanceTokensUseCase: GetAcceptanceTokensUseCase,
    private readonly getCheckoutConfigUseCase: GetCheckoutConfigUseCase,
  ) {}

  @Get('acceptance-tokens')
  getAcceptanceTokens() {
    return this.getAcceptanceTokensUseCase.execute();
  }

  @Get('checkout-config')
  getCheckoutConfig() {
    return this.getCheckoutConfigUseCase.execute();
  }
}
