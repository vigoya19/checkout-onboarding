import { Transaction } from '../../domain/transaction.entity';
import { InMemoryTransactionRepository } from './in-memory-transaction.repository';

const transaction = new Transaction(
  'tx-1',
  'tx-1',
  'prod-1',
  'Jane Doe',
  'jane@example.com',
  '3001234567',
  'Street 1',
  'Bogota',
  'Cundinamarca',
  1000,
  100,
  200,
  'PENDING',
  'NOT_STARTED',
  '2025-01-01T00:00:00.000Z',
);

describe('InMemoryTransactionRepository', () => {
  it('returns null for an unknown transaction', async () => {
    const repository = new InMemoryTransactionRepository();

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('stores a new transaction', async () => {
    const repository = new InMemoryTransactionRepository();

    await expect(repository.create(transaction)).resolves.toBe(transaction);
  });

  it('retrieves a stored transaction', async () => {
    const repository = new InMemoryTransactionRepository();
    await repository.create(transaction);

    await expect(repository.findById('tx-1')).resolves.toBe(transaction);
  });

  it('updates a transaction', async () => {
    const repository = new InMemoryTransactionRepository();

    await expect(repository.save(transaction)).resolves.toBe(transaction);
  });
});

