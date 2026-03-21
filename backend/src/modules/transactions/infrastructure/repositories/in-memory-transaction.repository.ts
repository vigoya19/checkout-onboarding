import { Injectable } from '@nestjs/common';
import type { TransactionRepositoryPort } from '../../application/ports/transaction-repository.port';
import type { Transaction } from '../../domain/transaction.entity';

@Injectable()
export class InMemoryTransactionRepository implements TransactionRepositoryPort {
  private readonly transactions = new Map<string, Transaction>();

  create(transaction: Transaction) {
    this.transactions.set(transaction.transactionId, transaction);

    return Promise.resolve(transaction);
  }

  findById(transactionId: string) {
    return Promise.resolve(this.transactions.get(transactionId) ?? null);
  }

  save(transaction: Transaction) {
    this.transactions.set(transaction.transactionId, transaction);

    return Promise.resolve(transaction);
  }
}
