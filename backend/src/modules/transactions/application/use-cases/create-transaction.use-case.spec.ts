import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Product } from '../../../catalog/domain/product.entity';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { CreateTransactionUseCase } from './create-transaction.use-case';

const payload = Object.assign(new CreateTransactionDto(), {
  productId: 'prod-1',
  customerEmail: 'jane@example.com',
  customerName: 'Jane Doe',
  customerPhone: '3001234567',
  addressLine1: 'Street 1',
  city: 'Bogota',
  department: 'Cundinamarca',
  amountInCents: 1000,
  baseFeeInCents: 100,
  deliveryFeeInCents: 200,
  currency: 'COP',
});

describe('CreateTransactionUseCase', () => {
  it('throws when the product does not exist', async () => {
    const useCase = new CreateTransactionUseCase(
      { findById: jest.fn().mockResolvedValue(null) } as never,
      { create: jest.fn() } as never,
    );

    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws when the product is out of stock', async () => {
    const useCase = new CreateTransactionUseCase(
      {
        findById: jest
          .fn()
          .mockResolvedValue(
            new Product('prod-1', 'PS5', 'desc', 1000, 'COP', 0),
          ),
      } as never,
      { create: jest.fn() } as never,
    );

    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('creates a pending transaction', async () => {
    const create = jest
      .fn()
      .mockImplementation(async (transaction) => transaction);
    const useCase = new CreateTransactionUseCase(
      {
        findById: jest
          .fn()
          .mockResolvedValue(
            new Product('prod-1', 'PS5', 'desc', 1000, 'COP', 2),
          ),
      } as never,
      { create } as never,
    );

    await expect(useCase.execute(payload)).resolves.toEqual(
      expect.objectContaining({
        productId: 'prod-1',
        paymentStatus: 'PENDING',
      }),
    );
    expect(create).toHaveBeenCalledTimes(1);
  });
});
