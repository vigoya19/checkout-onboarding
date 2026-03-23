import { MODULE_METADATA } from '@nestjs/common/constants';
import { CatalogModule } from './catalog.module';
import { DynamoProductRepository } from './infrastructure/repositories/dynamo-product.repository';
import { InMemoryProductRepository } from './infrastructure/repositories/in-memory-product.repository';

describe('CatalogModule', () => {
  it('selects the dynamo repository when enabled', () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      CatalogModule,
    );
    const factoryProvider = providers[3] as {
      useFactory: (
        config: { get: (key: string) => string },
        dynamo: unknown,
        memory: unknown,
      ) => unknown;
    };
    const dynamo = {} as DynamoProductRepository;

    expect(
      factoryProvider.useFactory(
        { get: () => 'true' },
        dynamo,
        {} as InMemoryProductRepository,
      ),
    ).toBe(dynamo);
  });

  it('selects the in-memory repository when dynamo is disabled', () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      CatalogModule,
    );
    const factoryProvider = providers[3] as {
      useFactory: (
        config: { get: (key: string) => string },
        dynamo: unknown,
        memory: unknown,
      ) => unknown;
    };
    const inMemory = {} as InMemoryProductRepository;

    expect(
      factoryProvider.useFactory(
        { get: () => 'false' },
        {} as DynamoProductRepository,
        inMemory,
      ),
    ).toBe(inMemory);
  });
});
