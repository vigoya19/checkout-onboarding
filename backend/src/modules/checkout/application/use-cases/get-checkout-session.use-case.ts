import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CHECKOUT_SESSION_REPOSITORY,
  type CheckoutSessionRepositoryPort,
} from '../ports/checkout-session-repository.port';

@Injectable()
export class GetCheckoutSessionUseCase {
  constructor(
    @Inject(CHECKOUT_SESSION_REPOSITORY)
    private readonly checkoutSessionRepository: CheckoutSessionRepositoryPort,
  ) {}

  async execute(sessionId: string) {
    const session = await this.checkoutSessionRepository.findById(sessionId);

    if (!session) {
      throw new NotFoundException(
        `Checkout session ${sessionId} was not found`,
      );
    }

    return session;
  }
}
