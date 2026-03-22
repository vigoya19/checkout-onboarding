import { NotFoundException } from '@nestjs/common';
import { CheckoutSession } from '../../domain/checkout-session.entity';
import { GetCheckoutSessionUseCase } from './get-checkout-session.use-case';

describe('GetCheckoutSessionUseCase', () => {
  it('returns an existing checkout session', async () => {
    const session = new CheckoutSession(
      'session-1',
      'prod',
      2,
      'customer@example.com',
      '2025-01-01T00:00:00.000Z',
    );
    const useCase = new GetCheckoutSessionUseCase({
      findById: jest.fn().mockResolvedValue(session),
    } as never);

    await expect(useCase.execute('session-1')).resolves.toBe(session);
  });

  it('throws when the checkout session does not exist', async () => {
    const useCase = new GetCheckoutSessionUseCase({
      findById: jest.fn().mockResolvedValue(null),
    } as never);

    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

