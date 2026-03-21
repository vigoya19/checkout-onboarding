import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import {
  PRODUCT_REPOSITORY,
  type ProductRepositoryPort,
} from './application/ports/product-repository.port';
import { CatalogController } from './catalog.controller';
import { DynamoProductRepository } from './infrastructure/repositories/dynamo-product.repository';
import { InMemoryProductRepository } from './infrastructure/repositories/in-memory-product.repository';
import { DynamoDbModule } from '../../shared/infrastructure/dynamodb/dynamodb.module';

@Module({
  imports: [DynamoDbModule],
  controllers: [CatalogController],
  providers: [
    ListProductsUseCase,
    InMemoryProductRepository,
    DynamoProductRepository,
    {
      provide: PRODUCT_REPOSITORY,
      inject: [
        ConfigService,
        DynamoProductRepository,
        InMemoryProductRepository,
      ],
      useFactory: (
        configService: ConfigService,
        dynamoRepository: DynamoProductRepository,
        inMemoryRepository: InMemoryProductRepository,
      ): ProductRepositoryPort =>
        configService.get<string>('USE_DYNAMODB') === 'true'
          ? dynamoRepository
          : inMemoryRepository,
    },
  ],
})
export class CatalogModule {}
