import { Product } from '../../domain/product.entity';
import { InMemoryProductRepository } from './in-memory-product.repository';

describe('InMemoryProductRepository', () => {
  it('returns null for an unknown product', async () => {
    const repository = new InMemoryProductRepository();

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('lists seeded products', async () => {
    const repository = new InMemoryProductRepository();

    await expect(repository.list()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'prod_ps5' })]),
    );
  });

  it('saves a product and lets it be queried later', async () => {
    const repository = new InMemoryProductRepository();
    const product = new Product('custom', 'Custom', 'desc', 100, 'COP', 2);

    await repository.save(product);

    await expect(repository.findById('custom')).resolves.toBe(product);
  });
});

