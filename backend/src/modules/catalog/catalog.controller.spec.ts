import { CatalogController } from './catalog.controller';

describe('CatalogController', () => {
  it('delegates product listing to the use case', async () => {
    const execute = jest.fn().mockResolvedValue(['product']);
    const controller = new CatalogController({ execute } as never);

    await expect(controller.listProducts()).resolves.toEqual(['product']);
    expect(execute).toHaveBeenCalledTimes(1);
  });
});

