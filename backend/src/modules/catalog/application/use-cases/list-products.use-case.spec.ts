import { ListProductsUseCase } from './list-products.use-case';

describe('ListProductsUseCase', () => {
  it('returns products from the repository', async () => {
    const list = jest.fn().mockResolvedValue(['product']);
    const useCase = new ListProductsUseCase({ list } as never);

    await expect(useCase.execute()).resolves.toEqual(['product']);
    expect(list).toHaveBeenCalledTimes(1);
  });
});

