import { PaymentsController } from './payments.controller';

describe('PaymentsController', () => {
  it('delegates acceptance token retrieval to the use case', async () => {
    const execute = jest.fn().mockResolvedValue('tokens');
    const controller = new PaymentsController(
      { execute } as never,
      { execute: jest.fn() } as never,
    );

    await expect(controller.getAcceptanceTokens()).resolves.toBe('tokens');
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('delegates checkout config retrieval to the use case', () => {
    const execute = jest.fn().mockReturnValue('config');
    const controller = new PaymentsController(
      { execute: jest.fn() } as never,
      { execute } as never,
    );

    expect(controller.getCheckoutConfig()).toBe('config');
    expect(execute).toHaveBeenCalledTimes(1);
  });
});
