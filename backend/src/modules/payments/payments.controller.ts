import { Controller, Get } from '@nestjs/common';
import { GetAcceptanceTokensUseCase } from './application/use-cases/get-acceptance-tokens.use-case';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly getAcceptanceTokensUseCase: GetAcceptanceTokensUseCase,
  ) {}

  @Get('acceptance-tokens')
  getAcceptanceTokens() {
    return this.getAcceptanceTokensUseCase.execute();
  }
}
