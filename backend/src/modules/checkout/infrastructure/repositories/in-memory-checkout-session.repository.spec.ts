import { CheckoutSession } from '../../domain/checkout-session.entity';
import { InMemoryCheckoutSessionRepository } from './in-memory-checkout-session.repository';

describe('InMemoryCheckoutSessionRepository', () => {
  it('returns null for an unknown session', async () => {
    const repository = new InMemoryCheckoutSessionRepository();

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('stores and retrieves a session', async () => {
    const repository = new InMemoryCheckoutSessionRepository();
    const session = new CheckoutSession(
      'session-1',
      'prod',
      2,
      'customer@example.com',
      '2025-01-01T00:00:00.000Z',
    );

    await repository.create(session);

    await expect(repository.findById('session-1')).resolves.toBe(session);
  });
});

