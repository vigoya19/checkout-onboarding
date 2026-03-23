import { MODULE_METADATA } from '@nestjs/common/constants';
import { DynamoTransactionRepository } from './infrastructure/repositories/dynamo-transaction.repository';
import { InMemoryTransactionRepository } from './infrastructure/repositories/in-memory-transaction.repository';
import { TransactionsModule } from './transactions.module';

describe('TransactionsModule', () => {
  it('selects the dynamo repository when enabled', () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      TransactionsModule,
    );
    const factoryProvider = providers[7] as {
      useFactory: (
        config: { get: (key: string) => string },
        dynamo: unknown,
        memory: unknown,
      ) => unknown;
    };
    const dynamo = {} as DynamoTransactionRepository;

    expect(
      factoryProvider.useFactory(
        { get: () => 'true' },
        dynamo,
        {} as InMemoryTransactionRepository,
      ),
    ).toBe(dynamo);
  });

  it('selects the in-memory repository when dynamo is disabled', () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      TransactionsModule,
    );
    const factoryProvider = providers[7] as {
      useFactory: (
        config: { get: (key: string) => string },
        dynamo: unknown,
        memory: unknown,
      ) => unknown;
    };
    const inMemory = {} as InMemoryTransactionRepository;

    expect(
      factoryProvider.useFactory(
        { get: () => 'false' },
        {} as DynamoTransactionRepository,
        inMemory,
      ),
    ).toBe(inMemory);
  });
});
