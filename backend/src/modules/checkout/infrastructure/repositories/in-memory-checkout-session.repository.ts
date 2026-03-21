import { Injectable } from '@nestjs/common';
import type { CheckoutSessionRepositoryPort } from '../../application/ports/checkout-session-repository.port';
import type { CheckoutSession } from '../../domain/checkout-session.entity';

@Injectable()
export class InMemoryCheckoutSessionRepository implements CheckoutSessionRepositoryPort {
  private readonly sessions = new Map<string, CheckoutSession>();

  create(session: CheckoutSession) {
    this.sessions.set(session.sessionId, session);

    return Promise.resolve(session);
  }

  findById(sessionId: string) {
    return Promise.resolve(this.sessions.get(sessionId) ?? null);
  }
}
