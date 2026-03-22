import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Customer } from '../../domain/customer.entity';
import { DynamoCustomerRepository } from './dynamo-customer.repository';

describe('DynamoCustomerRepository', () => {
  it('stores a customer', async () => {
    const send = jest.fn().mockResolvedValue({});
    const repository = new DynamoCustomerRepository(
      { send } as never,
      { get: jest.fn().mockReturnValue('CustomersTable') } as never,
    );
    const customer = new Customer(
      'customer-1',
      'Jane Doe',
      'jane@example.com',
      '3001234567',
      '2025-01-01T00:00:00.000Z',
    );

    await expect(repository.create(customer)).resolves.toBe(customer);
    expect(send.mock.calls[0][0]).toBeInstanceOf(PutCommand);
  });

  it('returns null when the customer does not exist', async () => {
    const repository = new DynamoCustomerRepository(
      { send: jest.fn().mockResolvedValue({ Item: undefined }) } as never,
      { get: jest.fn().mockReturnValue('CustomersTable') } as never,
    );

    await expect(repository.findByEmail('missing@example.com')).resolves.toBeNull();
  });

  it('maps an existing customer', async () => {
    const repository = new DynamoCustomerRepository(
      {
        send: jest.fn().mockResolvedValue({
          Item: {
            customerId: 'customer-1',
            fullName: 'Jane Doe',
            email: 'jane@example.com',
            phone: '3001234567',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        }),
      } as never,
      { get: jest.fn().mockReturnValue('CustomersTable') } as never,
    );

    await expect(repository.findByEmail('jane@example.com')).resolves.toEqual(
      new Customer(
        'customer-1',
        'Jane Doe',
        'jane@example.com',
        '3001234567',
        '2025-01-01T00:00:00.000Z',
      ),
    );
  });

  it('queries DynamoDB by email', async () => {
    const send = jest.fn().mockResolvedValue({ Item: undefined });
    const repository = new DynamoCustomerRepository(
      { send } as never,
      { get: jest.fn().mockReturnValue('CustomersTable') } as never,
    );

    await repository.findByEmail('jane@example.com');

    expect(send.mock.calls[0][0]).toBeInstanceOf(GetCommand);
  });

  it('uses the default table name when config is missing', async () => {
    const send = jest.fn().mockResolvedValue({ Item: undefined });
    const repository = new DynamoCustomerRepository(
      { send } as never,
      { get: jest.fn().mockReturnValue(undefined) } as never,
    );

    await repository.findByEmail('jane@example.com');

    expect(send.mock.calls[0][0].input.TableName).toBe('Customers');
  });
});
