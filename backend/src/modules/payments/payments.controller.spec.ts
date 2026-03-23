import { PaymentsController } from './payments.controller';

describe('PaymentsController', () => {
  it('delegates acceptance token retrieval to the use case', async () => {
    const execute = jest.fn().mockResolvedValue('tokens');
    const controller = new PaymentsController({ execute } as never);

    await expect(controller.getAcceptanceTokens()).resolves.toBe('tokens');
    expect(execute).toHaveBeenCalledTimes(1);
  });
});
