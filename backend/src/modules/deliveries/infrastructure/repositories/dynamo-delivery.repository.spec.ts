import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Delivery } from '../../domain/delivery.entity';
import { DynamoDeliveryRepository } from './dynamo-delivery.repository';

describe('DynamoDeliveryRepository', () => {
  it('stores a delivery', async () => {
    const send = jest.fn().mockResolvedValue({});
    const repository = new DynamoDeliveryRepository(
      { send } as never,
      { get: jest.fn().mockReturnValue('DeliveriesTable') } as never,
    );
    const delivery = new Delivery(
      'delivery-1',
      'tx-1',
      'jane@example.com',
      'Street 1',
      'Bogota',
      'PENDING',
      '2025-01-01T00:00:00.000Z',
    );

    await expect(repository.create(delivery)).resolves.toBe(delivery);
    expect(send.mock.calls[0][0]).toBeInstanceOf(PutCommand);
  });

  it('returns null when the delivery does not exist', async () => {
    const repository = new DynamoDeliveryRepository(
      { send: jest.fn().mockResolvedValue({ Item: undefined }) } as never,
      { get: jest.fn().mockReturnValue('DeliveriesTable') } as never,
    );

    await expect(repository.findByTransactionId('missing')).resolves.toBeNull();
  });

  it('maps an existing delivery', async () => {
    const repository = new DynamoDeliveryRepository(
      {
        send: jest.fn().mockResolvedValue({
          Item: {
            deliveryId: 'delivery-1',
            transactionId: 'tx-1',
            customerEmail: 'jane@example.com',
            addressLine1: 'Street 1',
            city: 'Bogota',
            status: 'PENDING',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        }),
      } as never,
      { get: jest.fn().mockReturnValue('DeliveriesTable') } as never,
    );

    await expect(repository.findByTransactionId('tx-1')).resolves.toEqual(
      new Delivery(
        'delivery-1',
        'tx-1',
        'jane@example.com',
        'Street 1',
        'Bogota',
        'PENDING',
        '2025-01-01T00:00:00.000Z',
      ),
    );
  });

  it('queries DynamoDB by transaction id', async () => {
    const send = jest.fn().mockResolvedValue({ Item: undefined });
    const repository = new DynamoDeliveryRepository(
      { send } as never,
      { get: jest.fn().mockReturnValue('DeliveriesTable') } as never,
    );

    await repository.findByTransactionId('tx-1');

    expect(send.mock.calls[0][0]).toBeInstanceOf(GetCommand);
  });

  it('uses the default table name when config is missing', async () => {
    const send = jest.fn().mockResolvedValue({ Item: undefined });
    const repository = new DynamoDeliveryRepository(
      { send } as never,
      { get: jest.fn().mockReturnValue(undefined) } as never,
    );

    await repository.findByTransactionId('tx-1');

    expect(send.mock.calls[0][0].input.TableName).toBe('Deliveries');
  });
});
