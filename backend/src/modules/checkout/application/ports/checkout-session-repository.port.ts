import type { CheckoutSession } from '../../domain/checkout-session.entity';

export const CHECKOUT_SESSION_REPOSITORY = Symbol(
  'CHECKOUT_SESSION_REPOSITORY',
);

export interface CheckoutSessionRepositoryPort {
  create(session: CheckoutSession): Promise<CheckoutSession>;
  findById(sessionId: string): Promise<CheckoutSession | null>;
}
