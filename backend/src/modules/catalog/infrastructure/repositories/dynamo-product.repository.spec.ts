import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Product } from '../../domain/product.entity';
import { DynamoProductRepository } from './dynamo-product.repository';

describe('DynamoProductRepository', () => {
  it('lists products from DynamoDB', async () => {
    const send = jest.fn().mockResolvedValue({
      Items: [
        {
          productId: 'prod',
          name: 'PS5',
          description: 'desc',
          priceInCents: 100,
          currency: 'COP',
          stock: 2,
        },
      ],
    });
    const repository = new DynamoProductRepository(
      { send } as never,
      { get: jest.fn().mockReturnValue('ProductsTable') } as never,
    );

    await expect(repository.list()).resolves.toEqual([
      new Product('prod', 'PS5', 'desc', 100, 'COP', 2),
    ]);
    expect(send.mock.calls[0][0]).toBeInstanceOf(ScanCommand);
  });

  it('returns an empty list when DynamoDB does not return items', async () => {
    const repository = new DynamoProductRepository(
      { send: jest.fn().mockResolvedValue({ Items: undefined }) } as never,
      { get: jest.fn().mockReturnValue('ProductsTable') } as never,
    );

    await expect(repository.list()).resolves.toEqual([]);
  });

  it('returns null when the product does not exist', async () => {
    const repository = new DynamoProductRepository(
      { send: jest.fn().mockResolvedValue({ Item: undefined }) } as never,
      { get: jest.fn().mockReturnValue('ProductsTable') } as never,
    );

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('maps an existing product from DynamoDB', async () => {
    const repository = new DynamoProductRepository(
      {
        send: jest.fn().mockResolvedValue({
          Item: {
            productId: 'prod',
            name: 'PS5',
            description: 'desc',
            priceInCents: 100,
            currency: 'COP',
            stock: 2,
          },
        }),
      } as never,
      { get: jest.fn().mockReturnValue('ProductsTable') } as never,
    );

    await expect(repository.findById('prod')).resolves.toEqual(
      new Product('prod', 'PS5', 'desc', 100, 'COP', 2),
    );
  });

  it('stores products in DynamoDB', async () => {
    const send = jest.fn().mockResolvedValue({});
    const repository = new DynamoProductRepository(
      { send } as never,
      { get: jest.fn().mockReturnValue('ProductsTable') } as never,
    );
    const product = new Product('prod', 'PS5', 'desc', 100, 'COP', 2);

    await expect(repository.save(product)).resolves.toBe(product);
    expect(send.mock.calls[0][0]).toBeInstanceOf(PutCommand);
  });

  it('uses the default table name when config is missing', async () => {
    const send = jest.fn().mockResolvedValue({ Items: [] });
    const repository = new DynamoProductRepository(
      { send } as never,
      { get: jest.fn().mockReturnValue(undefined) } as never,
    );

    await repository.list();

    expect(send.mock.calls[0][0].input.TableName).toBe('Products');
  });
});
