import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import {
  CHECKOUT_SESSION_REPOSITORY,
  type CheckoutSessionRepositoryPort,
} from '../ports/checkout-session-repository.port';
import { CreateCheckoutSessionDto } from '../../dto/create-checkout-session.dto';
import { CheckoutSession } from '../../domain/checkout-session.entity';

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    @Inject(CHECKOUT_SESSION_REPOSITORY)
    private readonly checkoutSessionRepository: CheckoutSessionRepositoryPort,
  ) {}

  execute(payload: CreateCheckoutSessionDto) {
    const session = new CheckoutSession(
      randomUUID(),
      payload.productId,
      payload.currentStep,
      payload.customerEmail,
      new Date().toISOString(),
    );

    return this.checkoutSessionRepository.create(session);
  }
}
