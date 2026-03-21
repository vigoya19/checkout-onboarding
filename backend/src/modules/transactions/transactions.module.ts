import { Module } from '@nestjs/common';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { GetTransactionUseCase } from './application/use-cases/get-transaction.use-case';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from './application/ports/transaction-repository.port';
import { TransactionsController } from './transactions.controller';
import { InMemoryTransactionRepository } from './infrastructure/repositories/in-memory-transaction.repository';

@Module({
  controllers: [TransactionsController],
  providers: [
    CreateTransactionUseCase,
    GetTransactionUseCase,
    InMemoryTransactionRepository,
    {
      provide: TRANSACTION_REPOSITORY,
      useExisting: InMemoryTransactionRepository,
    } satisfies {
      provide: symbol;
      useExisting: new (...args: never[]) => TransactionRepositoryPort;
    },
  ],
})
export class TransactionsModule {}
