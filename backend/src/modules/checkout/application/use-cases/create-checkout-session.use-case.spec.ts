import { CreateCheckoutSessionDto } from '../../dto/create-checkout-session.dto';
import { CreateCheckoutSessionUseCase } from './create-checkout-session.use-case';

describe('CreateCheckoutSessionUseCase', () => {
  it('creates a checkout session in the repository', async () => {
    const create = jest.fn().mockImplementation(async (session) => session);
    const useCase = new CreateCheckoutSessionUseCase({ create } as never);
    const payload = Object.assign(new CreateCheckoutSessionDto(), {
      productId: 'prod',
      currentStep: 2,
      customerEmail: 'customer@example.com',
    });

    await expect(useCase.execute(payload)).resolves.toEqual(
      expect.objectContaining({
        productId: 'prod',
        currentStep: 2,
        customerEmail: 'customer@example.com',
      }),
    );
    expect(create).toHaveBeenCalledTimes(1);
  });
});

