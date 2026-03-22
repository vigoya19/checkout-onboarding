import { CheckoutSession } from './checkout-session.entity';

describe('CheckoutSession', () => {
  it('stores the provided state', () => {
    const session = new CheckoutSession(
      'session-1',
      'prod',
      2,
      'customer@example.com',
      '2025-01-01T00:00:00.000Z',
    );

    expect(session).toEqual(
      expect.objectContaining({
        sessionId: 'session-1',
        productId: 'prod',
        currentStep: 2,
        customerEmail: 'customer@example.com',
      }),
    );
  });
});

