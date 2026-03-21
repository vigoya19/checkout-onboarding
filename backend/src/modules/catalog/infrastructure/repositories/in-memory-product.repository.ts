import { Injectable } from '@nestjs/common';
import type { ProductRepositoryPort } from '../../application/ports/product-repository.port';
import { Product } from '../../domain/product.entity';

@Injectable()
export class InMemoryProductRepository implements ProductRepositoryPort {
  private readonly products = [
    new Product(
      'prod_ps5',
      'PlayStation 5',
      'Consola PS5 de nueva generacion con almacenamiento de 1 TB y soporte para juego en 4K.',
      299900000,
      'COP',
      6,
    ),
    new Product(
      'prod_ps4',
      'PlayStation 4',
      'Consola PS4 Slim de 1 TB ideal para catalogo legacy y juegos de generacion anterior.',
      139989000,
      'COP',
      8,
    ),
    new Product(
      'prod_xbox_series_x',
      'Xbox Series X',
      'Consola Xbox Series X de 1 TB para juego en 4K con alto rendimiento.',
      309990000,
      'COP',
      5,
    ),
    new Product(
      'prod_xbox_series_s',
      'Xbox Series S',
      'Consola Xbox Series S compacta con 512 GB y excelente relacion costo-rendimiento.',
      194990000,
      'COP',
      9,
    ),
    new Product(
      'prod_nintendo_switch',
      'Nintendo Switch',
      'Consola hibrida Nintendo Switch con Joy-Con y bundle digital de Mario Kart 8.',
      159900000,
      'COP',
      12,
    ),
    new Product(
      'prod_nintendo_switch_2',
      'Nintendo Switch 2',
      'Nueva Nintendo Switch 2 con mejoras de rendimiento y precio oficial sugerido en Colombia.',
      285990000,
      'COP',
      7,
    ),
  ];

  list() {
    return Promise.resolve(this.products);
  }
}
