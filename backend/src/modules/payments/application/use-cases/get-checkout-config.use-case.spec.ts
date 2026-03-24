import { GetCheckoutConfigUseCase } from './get-checkout-config.use-case';

describe('GetCheckoutConfigUseCase', () => {
  it('returns checkout fees from config', () => {
    const get = jest
      .fn()
      .mockImplementation((key: string) =>
        key === 'CHECKOUT_BASE_FEE_IN_CENTS' ? 123_000 : 456_000,
      );
    const useCase = new GetCheckoutConfigUseCase({
      get,
    } as never);

    expect(useCase.execute()).toEqual({
      baseFeeInCents: 123_000,
      deliveryFeeInCents: 456_000,
    });
  });

  it('falls back to defaults when config is missing', () => {
    const useCase = new GetCheckoutConfigUseCase({
      get: jest.fn().mockReturnValue(undefined),
    } as never);

    expect(useCase.execute()).toEqual({
      baseFeeInCents: 390_000,
      deliveryFeeInCents: 990_000,
    });
  });
});
