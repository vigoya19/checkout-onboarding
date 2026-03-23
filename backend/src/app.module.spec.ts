import { MODULE_METADATA } from '@nestjs/common/constants';
import { AppModule } from './app.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { HealthModule } from './modules/health/health.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TransactionsModule } from './modules/transactions/transactions.module';

describe('AppModule', () => {
  it('imports all feature modules', () => {
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, AppModule);

    expect(imports).toEqual(
      expect.arrayContaining([
        HealthModule,
        CatalogModule,
        CustomersModule,
        DeliveriesModule,
        PaymentsModule,
        TransactionsModule,
      ]),
    );
  });
});
