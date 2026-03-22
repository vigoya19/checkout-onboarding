import { MODULE_METADATA } from '@nestjs/common/constants';
import { CustomersModule } from './customers.module';
import { DynamoCustomerRepository } from './infrastructure/repositories/dynamo-customer.repository';
import { InMemoryCustomerRepository } from './infrastructure/repositories/in-memory-customer.repository';

describe('CustomersModule', () => {
  it('selects the dynamo repository when enabled', () => {
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, CustomersModule);
    const factoryProvider = providers[2] as {
      useFactory: (config: { get: (key: string) => string }, dynamo: unknown, memory: unknown) => unknown;
    };
    const dynamo = {} as DynamoCustomerRepository;

    expect(
      factoryProvider.useFactory(
        { get: () => 'true' },
        dynamo,
        {} as InMemoryCustomerRepository,
      ),
    ).toBe(dynamo);
  });

  it('selects the in-memory repository when dynamo is disabled', () => {
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, CustomersModule);
    const factoryProvider = providers[2] as {
      useFactory: (config: { get: (key: string) => string }, dynamo: unknown, memory: unknown) => unknown;
    };
    const inMemory = {} as InMemoryCustomerRepository;

    expect(
      factoryProvider.useFactory(
        { get: () => 'false' },
        {} as DynamoCustomerRepository,
        inMemory,
      ),
    ).toBe(inMemory);
  });
});

