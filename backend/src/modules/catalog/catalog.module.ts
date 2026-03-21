import { Module } from '@nestjs/common';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import {
  PRODUCT_REPOSITORY,
  type ProductRepositoryPort,
} from './application/ports/product-repository.port';
import { CatalogController } from './catalog.controller';
import { InMemoryProductRepository } from './infrastructure/repositories/in-memory-product.repository';

@Module({
  controllers: [CatalogController],
  providers: [
    ListProductsUseCase,
    InMemoryProductRepository,
    {
      provide: PRODUCT_REPOSITORY,
      useExisting: InMemoryProductRepository,
    } satisfies {
      provide: symbol;
      useExisting: new (...args: never[]) => ProductRepositoryPort;
    },
  ],
})
export class CatalogModule {}
