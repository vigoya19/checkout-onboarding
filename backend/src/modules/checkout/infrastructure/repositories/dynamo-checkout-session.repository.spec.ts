import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { CheckoutSession } from '../../domain/checkout-session.entity';
import { DynamoCheckoutSessionRepository } from './dynamo-checkout-session.repository';

describe('DynamoCheckoutSessionRepository', () => {
  it('stores a checkout session', async () => {
    const send = jest.fn().mockResolvedValue({});
    const repository = new DynamoCheckoutSessionRepository(
      { send } as never,
      { get: jest.fn().mockReturnValue('CheckoutSessionsTable') } as never,
    );
    const session = new CheckoutSession(
      'session-1',
      'prod',
      2,
      'customer@example.com',
      '2025-01-01T00:00:00.000Z',
    );

    await expect(repository.create(session)).resolves.toBe(session);
    expect(send.mock.calls[0][0]).toBeInstanceOf(PutCommand);
  });

  it('returns null when the session does not exist', async () => {
    const repository = new DynamoCheckoutSessionRepository(
      { send: jest.fn().mockResolvedValue({ Item: undefined }) } as never,
      { get: jest.fn().mockReturnValue('CheckoutSessionsTable') } as never,
    );

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('maps an existing checkout session', async () => {
    const repository = new DynamoCheckoutSessionRepository(
      {
        send: jest.fn().mockResolvedValue({
          Item: {
            sessionId: 'session-1',
            productId: 'prod',
            currentStep: 2,
            customerEmail: 'customer@example.com',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        }),
      } as never,
      { get: jest.fn().mockReturnValue('CheckoutSessionsTable') } as never,
    );

    await expect(repository.findById('session-1')).resolves.toEqual(
      new CheckoutSession(
        'session-1',
        'prod',
        2,
        'customer@example.com',
        '2025-01-01T00:00:00.000Z',
      ),
    );
  });

  it('queries DynamoDB by session id', async () => {
    const send = jest.fn().mockResolvedValue({ Item: undefined });
    const repository = new DynamoCheckoutSessionRepository(
      { send } as never,
      { get: jest.fn().mockReturnValue('CheckoutSessionsTable') } as never,
    );

    await repository.findById('session-1');

    expect(send.mock.calls[0][0]).toBeInstanceOf(GetCommand);
  });

  it('uses the default table name when config is missing', async () => {
    const send = jest.fn().mockResolvedValue({ Item: undefined });
    const repository = new DynamoCheckoutSessionRepository(
      { send } as never,
      { get: jest.fn().mockReturnValue(undefined) } as never,
    );

    await repository.findById('session-1');

    expect(send.mock.calls[0][0].input.TableName).toBe('CheckoutSessions');
  });
});
