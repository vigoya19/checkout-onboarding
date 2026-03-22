import { CheckoutController } from './checkout.controller';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

describe('CheckoutController', () => {
  it('delegates session creation to the use case', async () => {
    const payload = Object.assign(new CreateCheckoutSessionDto(), {
      productId: 'prod',
      currentStep: 2,
      customerEmail: 'customer@example.com',
    });
    const execute = jest.fn().mockResolvedValue('created');
    const controller = new CheckoutController(
      { execute } as never,
      { execute: jest.fn() } as never,
    );

    await expect(controller.createSession(payload)).resolves.toBe('created');
    expect(execute).toHaveBeenCalledWith(payload);
  });

  it('delegates session retrieval to the use case', async () => {
    const execute = jest.fn().mockResolvedValue('session');
    const controller = new CheckoutController(
      { execute: jest.fn() } as never,
      { execute } as never,
    );

    await expect(controller.getSession('session-1')).resolves.toBe('session');
    expect(execute).toHaveBeenCalledWith('session-1');
  });
});

