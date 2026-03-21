import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { GetTransactionUseCase } from './application/use-cases/get-transaction.use-case';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from './application/ports/transaction-repository.port';
import { TransactionsController } from './transactions.controller';
import { DynamoTransactionRepository } from './infrastructure/repositories/dynamo-transaction.repository';
import { InMemoryTransactionRepository } from './infrastructure/repositories/in-memory-transaction.repository';
import { DynamoDbModule } from '../../shared/infrastructure/dynamodb/dynamodb.module';

@Module({
  imports: [DynamoDbModule],
  controllers: [TransactionsController],
  providers: [
    CreateTransactionUseCase,
    GetTransactionUseCase,
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
