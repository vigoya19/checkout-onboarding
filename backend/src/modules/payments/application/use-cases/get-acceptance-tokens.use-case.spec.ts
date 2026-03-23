import { GetAcceptanceTokensUseCase } from './get-acceptance-tokens.use-case';

describe('GetAcceptanceTokensUseCase', () => {
  it('requests acceptance tokens from the gateway', async () => {
    const getAcceptanceTokens = jest.fn().mockResolvedValue('tokens');
    const useCase = new GetAcceptanceTokensUseCase({
      getAcceptanceTokens,
    } as never);

    await expect(useCase.execute()).resolves.toBe('tokens');
    expect(getAcceptanceTokens).toHaveBeenCalledTimes(1);
  });
});
