import { Product } from './product.entity';

describe('Product', () => {
  it('creates a new instance when stock changes', () => {
    const product = new Product('prod', 'PS5', 'desc', 1000, 'COP', 3);

    const updated = product.updateStock(1);

    expect(updated).not.toBe(product);
  });

  it('preserves product identity when stock changes', () => {
    const product = new Product('prod', 'PS5', 'desc', 1000, 'COP', 3);

    const updated = product.updateStock(1);

    expect(updated.id).toBe('prod');
  });

  it('stores the new stock value', () => {
    const product = new Product('prod', 'PS5', 'desc', 1000, 'COP', 3);

    const updated = product.updateStock(1);

    expect(updated.stock).toBe(1);
  });
});
