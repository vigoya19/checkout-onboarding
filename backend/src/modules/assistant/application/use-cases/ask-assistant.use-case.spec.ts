import { AskAssistantUseCase } from './ask-assistant.use-case';

describe('AskAssistantUseCase', () => {
  it('delegates to the assistant client', async () => {
    const answer = jest.fn().mockResolvedValue('ok');
    const findById = jest.fn().mockResolvedValue(null);
    const useCase = new AskAssistantUseCase(
      { answer } as never,
      { findById } as never,
    );
    const payload = { message: '¿Como pago?' };

    await expect(useCase.execute(payload)).resolves.toBe('ok');
    expect(answer).toHaveBeenCalledWith(payload);
  });

  it('enriches the request with product data from the repository', async () => {
    const answer = jest.fn().mockResolvedValue('ok');
    const findById = jest.fn().mockResolvedValue({
      id: 'prod_ps5',
      name: 'PlayStation 5',
      description: 'Consola PS5',
      features: ['1 TB SSD'],
      priceInCents: 299_900_000,
      currency: 'COP',
      stock: 4,
    });
    const useCase = new AskAssistantUseCase(
      { answer } as never,
      { findById } as never,
    );

    await expect(
      useCase.execute({
        message: '¿Que incluye el total?',
        productId: 'prod_ps5',
        baseFeeInCents: 390_000,
        deliveryFeeInCents: 990_000,
        currentStep: 1,
      }),
    ).resolves.toBe('ok');

    expect(findById).toHaveBeenCalledWith('prod_ps5');
    expect(answer).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'prod_ps5',
        productName: 'PlayStation 5',
        productDescription: 'Consola PS5',
        features: ['1 TB SSD'],
        priceInCents: 299_900_000,
        currency: 'COP',
        stock: 4,
      }),
    );
  });
});
