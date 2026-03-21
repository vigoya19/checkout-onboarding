import { Module } from '@nestjs/common';
import { CreateCheckoutSessionUseCase } from './application/use-cases/create-checkout-session.use-case';
import { GetCheckoutSessionUseCase } from './application/use-cases/get-checkout-session.use-case';
import {
  CHECKOUT_SESSION_REPOSITORY,
  type CheckoutSessionRepositoryPort,
} from './application/ports/checkout-session-repository.port';
import { CheckoutController } from './checkout.controller';
import { InMemoryCheckoutSessionRepository } from './infrastructure/repositories/in-memory-checkout-session.repository';

@Module({
  controllers: [CheckoutController],
  providers: [
    CreateCheckoutSessionUseCase,
    GetCheckoutSessionUseCase,
    InMemoryCheckoutSessionRepository,
    {
      provide: CHECKOUT_SESSION_REPOSITORY,
      useExisting: InMemoryCheckoutSessionRepository,
    } satisfies {
      provide: symbol;
      useExisting: new (...args: never[]) => CheckoutSessionRepositoryPort;
    },
  ],
})
export class CheckoutModule {}
