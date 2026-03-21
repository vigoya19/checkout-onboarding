import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateCheckoutSessionUseCase } from './application/use-cases/create-checkout-session.use-case';
import { GetCheckoutSessionUseCase } from './application/use-cases/get-checkout-session.use-case';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@Controller('checkout/sessions')
export class CheckoutController {
  constructor(
    private readonly createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
    private readonly getCheckoutSessionUseCase: GetCheckoutSessionUseCase,
  ) {}

  @Post()
  createSession(@Body() payload: CreateCheckoutSessionDto) {
    return this.createCheckoutSessionUseCase.execute(payload);
  }

  @Get(':sessionId')
  getSession(@Param('sessionId') sessionId: string) {
    return this.getCheckoutSessionUseCase.execute(sessionId);
  }
}
