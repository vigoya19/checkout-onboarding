import { Injectable } from '@nestjs/common';
import type { ProductRepositoryPort } from '../../application/ports/product-repository.port';
import { Product } from '../../domain/product.entity';

@Injectable()
export class InMemoryProductRepository implements ProductRepositoryPort {
  private readonly products = [
    new Product(
      'prod_coffee_press',
      'Aura Coffee Press',
      'Producto inicial para conectar mas adelante con DynamoDB y el flujo de pago.',
      189900,
      'COP',
      12,
    ),
  ];

  list() {
    return Promise.resolve(this.products);
  }
}
