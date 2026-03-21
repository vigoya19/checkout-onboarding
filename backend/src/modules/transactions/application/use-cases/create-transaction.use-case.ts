import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from '../ports/transaction-repository.port';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { Transaction } from '../../domain/transaction.entity';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  execute(payload: CreateTransactionDto) {
    const transactionId = randomUUID();
    const transaction = new Transaction(
      transactionId,
      transactionId,
      payload.productId,
      payload.customerEmail,
      payload.amountInCents,
      payload.baseFeeInCents,
      payload.deliveryFeeInCents,
      'PENDING',
      'NOT_STARTED',
      new Date().toISOString(),
    );

    return this.transactionRepository.create(transaction);
  }
}
