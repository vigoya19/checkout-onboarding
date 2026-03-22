import { Product } from '../../../catalog/domain/product.entity';
import { Customer } from '../../../customers/domain/customer.entity';
import { Delivery } from '../../../deliveries/domain/delivery.entity';
import { Transaction } from '../../domain/transaction.entity';
import { FulfillApprovedTransactionUseCase } from './fulfill-approved-transaction.use-case';

const approvedTransaction = new Transaction(
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
  'APPROVED',
  'NOT_STARTED',
  '2025-01-01T00:00:00.000Z',
);

describe('FulfillApprovedTransactionUseCase', () => {
  it('returns the transaction unchanged when the payment is not approved', async () => {
    const useCase = new FulfillApprovedTransactionUseCase(
      { findById: jest.fn(), save: jest.fn() } as never,
      { findByEmail: jest.fn(), create: jest.fn() } as never,
      { findByTransactionId: jest.fn(), create: jest.fn() } as never,
    );
    const pending = approvedTransaction.syncPayment({
      paymentStatus: 'PENDING',
      wompiTransactionId: null,
      paymentMethodType: null,
      paymentStatusMessage: null,
      cardBrand: null,
      cardLastFour: null,
    });

    await expect(useCase.execute(pending)).resolves.toBe(pending);
  });

  it('returns the transaction unchanged when it is already completed', async () => {
    const useCase = new FulfillApprovedTransactionUseCase(
      { findById: jest.fn(), save: jest.fn() } as never,
      { findByEmail: jest.fn(), create: jest.fn() } as never,
      { findByTransactionId: jest.fn(), create: jest.fn() } as never,
    );
    const completed = approvedTransaction.syncFulfillment({
      fulfillmentStatus: 'COMPLETED',
    });

    await expect(useCase.execute(completed)).resolves.toBe(completed);
  });

  it('marks fulfillment as failed when the product does not exist', async () => {
    const useCase = new FulfillApprovedTransactionUseCase(
      { findById: jest.fn().mockResolvedValue(null), save: jest.fn() } as never,
      { findByEmail: jest.fn(), create: jest.fn() } as never,
      { findByTransactionId: jest.fn(), create: jest.fn() } as never,
    );

    await expect(useCase.execute(approvedTransaction)).resolves.toEqual(
      expect.objectContaining({ fulfillmentStatus: 'FAILED' }),
    );
  });

  it('marks fulfillment as failed when the product is out of stock', async () => {
    const useCase = new FulfillApprovedTransactionUseCase(
      {
        findById: jest.fn().mockResolvedValue(
          new Product('prod-1', 'PS5', 'desc', 1000, 'COP', 0),
        ),
        save: jest.fn(),
      } as never,
      { findByEmail: jest.fn(), create: jest.fn() } as never,
      { findByTransactionId: jest.fn(), create: jest.fn() } as never,
    );

    await expect(useCase.execute(approvedTransaction)).resolves.toEqual(
      expect.objectContaining({ fulfillmentStatus: 'FAILED' }),
    );
  });

  it('creates missing customer and delivery records', async () => {
    const productRepository = {
      findById: jest
        .fn()
        .mockResolvedValue(new Product('prod-1', 'PS5', 'desc', 1000, 'COP', 2)),
      save: jest.fn().mockImplementation(async (product) => product),
    };
    const customerRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    };
    const deliveryRepository = {
      findByTransactionId: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    };
    const useCase = new FulfillApprovedTransactionUseCase(
      productRepository as never,
      customerRepository as never,
      deliveryRepository as never,
    );

    await useCase.execute(approvedTransaction);

    expect(customerRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'jane@example.com' }),
    );
    expect(deliveryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ transactionId: 'tx-1' }),
    );
  });

  it('decrements stock and completes fulfillment', async () => {
    const productRepository = {
      findById: jest
        .fn()
        .mockResolvedValue(new Product('prod-1', 'PS5', 'desc', 1000, 'COP', 2)),
      save: jest.fn().mockImplementation(async (product) => product),
    };
    const useCase = new FulfillApprovedTransactionUseCase(
      productRepository as never,
      {
        findByEmail: jest
          .fn()
          .mockResolvedValue(
            new Customer('customer-1', 'Jane Doe', 'jane@example.com', '3001234567', 'date'),
          ),
        create: jest.fn(),
      } as never,
      {
        findByTransactionId: jest
          .fn()
          .mockResolvedValue(
            new Delivery('delivery-1', 'tx-1', 'jane@example.com', 'Street 1', 'Bogota', 'PENDING', 'date'),
          ),
        create: jest.fn(),
      } as never,
    );

    await expect(useCase.execute(approvedTransaction)).resolves.toEqual(
      expect.objectContaining({ fulfillmentStatus: 'COMPLETED' }),
    );
    expect(productRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ stock: 1 }),
    );
  });
});

