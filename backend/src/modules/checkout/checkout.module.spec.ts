import { MODULE_METADATA } from '@nestjs/common/constants';
import { CheckoutModule } from './checkout.module';
import { DynamoCheckoutSessionRepository } from './infrastructure/repositories/dynamo-checkout-session.repository';
import { InMemoryCheckoutSessionRepository } from './infrastructure/repositories/in-memory-checkout-session.repository';

describe('CheckoutModule', () => {
  it('selects the dynamo repository when enabled', () => {
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, CheckoutModule);
    const factoryProvider = providers[4] as {
      useFactory: (config: { get: (key: string) => string }, dynamo: unknown, memory: unknown) => unknown;
    };
    const dynamo = {} as DynamoCheckoutSessionRepository;

    expect(
      factoryProvider.useFactory(
        { get: () => 'true' },
        dynamo,
        {} as InMemoryCheckoutSessionRepository,
      ),
    ).toBe(dynamo);
  });

  it('selects the in-memory repository when dynamo is disabled', () => {
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, CheckoutModule);
    const factoryProvider = providers[4] as {
      useFactory: (config: { get: (key: string) => string }, dynamo: unknown, memory: unknown) => unknown;
    };
    const inMemory = {} as InMemoryCheckoutSessionRepository;

    expect(
      factoryProvider.useFactory(
        { get: () => 'false' },
        {} as DynamoCheckoutSessionRepository,
        inMemory,
      ),
    ).toBe(inMemory);
  });
});

