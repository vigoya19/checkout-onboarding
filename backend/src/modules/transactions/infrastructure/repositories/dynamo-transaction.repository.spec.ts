import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Transaction } from '../../domain/transaction.entity';
import { DynamoTransactionRepository } from './dynamo-transaction.repository';

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

describe('DynamoTransactionRepository', () => {
  it('returns null when the transaction does not exist', async () => {
    const repository = new DynamoTransactionRepository(
      { send: jest.fn().mockResolvedValue({ Item: undefined }) } as never,
      { get: jest.fn().mockReturnValue('TransactionsTable') } as never,
    );

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('maps an existing transaction', async () => {
    const repository = new DynamoTransactionRepository(
      {
        send: jest.fn().mockResolvedValue({
          Item: {
            transactionId: 'tx-1',
            reference: 'tx-1',
            productId: 'prod-1',
            customerName: 'Jane Doe',
            customerEmail: 'jane@example.com',
            customerPhone: '3001234567',
            addressLine1: 'Street 1',
            city: 'Bogota',
            department: 'Cundinamarca',
            amountInCents: 1000,
            baseFeeInCents: 100,
            deliveryFeeInCents: 200,
            paymentStatus: 'PENDING',
            fulfillmentStatus: 'NOT_STARTED',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        }),
      } as never,
      { get: jest.fn().mockReturnValue('TransactionsTable') } as never,
    );

    await expect(repository.findById('tx-1')).resolves.toEqual(transaction);
  });

  it('delegates create to save', async () => {
    const send = jest.fn().mockResolvedValue({});
    const repository = new DynamoTransactionRepository(
      { send } as never,
      { get: jest.fn().mockReturnValue('TransactionsTable') } as never,
    );

    await expect(repository.create(transaction)).resolves.toBe(transaction);
    expect(send.mock.calls[0][0]).toBeInstanceOf(PutCommand);
  });

  it('stores a transaction', async () => {
    const send = jest.fn().mockResolvedValue({});
    const repository = new DynamoTransactionRepository(
      { send } as never,
      { get: jest.fn().mockReturnValue('TransactionsTable') } as never,
    );

    await expect(repository.save(transaction)).resolves.toBe(transaction);
    expect(send.mock.calls[0][0]).toBeInstanceOf(PutCommand);
  });

  it('queries DynamoDB by transaction id', async () => {
    const send = jest.fn().mockResolvedValue({ Item: undefined });
    const repository = new DynamoTransactionRepository(
      { send } as never,
      { get: jest.fn().mockReturnValue('TransactionsTable') } as never,
    );

    await repository.findById('tx-1');

    expect(send.mock.calls[0][0]).toBeInstanceOf(GetCommand);
  });

  it('uses the default table name when config is missing', async () => {
    const send = jest.fn().mockResolvedValue({ Item: undefined });
    const repository = new DynamoTransactionRepository(
      { send } as never,
      { get: jest.fn().mockReturnValue(undefined) } as never,
    );

    await repository.findById('tx-1');

    expect(send.mock.calls[0][0].input.TableName).toBe('Transactions');
  });
});
