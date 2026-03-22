import type { Product } from '../../domain/product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductRepositoryPort {
  list(): Promise<Product[]>;
  findById(productId: string): Promise<Product | null>;
  save(product: Product): Promise<Product>;
}
