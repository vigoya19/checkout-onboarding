import { MODULE_METADATA } from '@nestjs/common/constants';
import { DeliveriesModule } from './deliveries.module';
import { DynamoDeliveryRepository } from './infrastructure/repositories/dynamo-delivery.repository';
import { InMemoryDeliveryRepository } from './infrastructure/repositories/in-memory-delivery.repository';

describe('DeliveriesModule', () => {
  it('selects the dynamo repository when enabled', () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      DeliveriesModule,
    );
    const factoryProvider = providers[2] as {
      useFactory: (
        config: { get: (key: string) => string },
        dynamo: unknown,
        memory: unknown,
      ) => unknown;
    };
    const dynamo = {} as DynamoDeliveryRepository;

    expect(
      factoryProvider.useFactory(
        { get: () => 'true' },
        dynamo,
        {} as InMemoryDeliveryRepository,
      ),
    ).toBe(dynamo);
  });

  it('selects the in-memory repository when dynamo is disabled', () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      DeliveriesModule,
    );
    const factoryProvider = providers[2] as {
      useFactory: (
        config: { get: (key: string) => string },
        dynamo: unknown,
        memory: unknown,
      ) => unknown;
    };
    const inMemory = {} as InMemoryDeliveryRepository;

    expect(
      factoryProvider.useFactory(
        { get: () => 'false' },
        {} as DynamoDeliveryRepository,
        inMemory,
      ),
    ).toBe(inMemory);
  });
});
