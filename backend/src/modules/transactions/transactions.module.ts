import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CatalogModule } from '../catalog/catalog.module';
import { CustomersModule } from '../customers/customers.module';
import { DeliveriesModule } from '../deliveries/deliveries.module';
import { PaymentsModule } from '../payments/payments.module';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { FulfillApprovedTransactionUseCase } from './application/use-cases/fulfill-approved-transaction.use-case';
import { GetTransactionUseCase } from './application/use-cases/get-transaction.use-case';
import { HandleWompiWebhookUseCase } from './application/use-cases/handle-wompi-webhook.use-case';
import { ProcessTransactionPaymentUseCase } from './application/use-cases/process-transaction-payment.use-case';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from './application/ports/transaction-repository.port';
import {
  TransactionsController,
  WompiWebhookController,
} from './transactions.controller';
import { DynamoTransactionRepository } from './infrastructure/repositories/dynamo-transaction.repository';
import { InMemoryTransactionRepository } from './infrastructure/repositories/in-memory-transaction.repository';
import { DynamoDbModule } from '../../shared/infrastructure/dynamodb/dynamodb.module';

@Module({
  imports: [
    DynamoDbModule,
    PaymentsModule,
    CatalogModule,
    CustomersModule,
    DeliveriesModule,
  ],
  controllers: [TransactionsController, WompiWebhookController],
  providers: [
    CreateTransactionUseCase,
    FulfillApprovedTransactionUseCase,
    GetTransactionUseCase,
    ProcessTransactionPaymentUseCase,
    HandleWompiWebhookUseCase,
    InMemoryTransactionRepository,
    DynamoTransactionRepository,
    {
      provide: TRANSACTION_REPOSITORY,
      inject: [
        ConfigService,
        DynamoTransactionRepository,
        InMemoryTransactionRepository,
      ],
      useFactory: (
        configService: ConfigService,
        dynamoRepository: DynamoTransactionRepository,
        inMemoryRepository: InMemoryTransactionRepository,
      ): TransactionRepositoryPort =>
        configService.get<string>('USE_DYNAMODB') === 'true'
          ? dynamoRepository
          : inMemoryRepository,
    },
  ],
})
export class TransactionsModule {}
