import { NotFoundException } from '@nestjs/common';
import { Transaction } from '../../domain/transaction.entity';
import { GetTransactionUseCase } from './get-transaction.use-case';

const pendingTransaction = new Transaction(
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
  'wompi-1',
);

describe('GetTransactionUseCase', () => {
  it('throws when the transaction does not exist', async () => {
    const useCase = new GetTransactionUseCase(
      { findById: jest.fn().mockResolvedValue(null), save: jest.fn() } as never,
      { getTransaction: jest.fn() } as never,
      { execute: jest.fn() } as never,
    );

    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns non-pending transactions without syncing Wompi', async () => {
    const transaction = pendingTransaction.syncPayment({
      paymentStatus: 'DECLINED',
      wompiTransactionId: null,
      paymentMethodType: null,
      paymentStatusMessage: null,
      cardBrand: null,
      cardLastFour: null,
    });
    const getTransaction = jest.fn();
    const useCase = new GetTransactionUseCase(
      { findById: jest.fn().mockResolvedValue(transaction), save: jest.fn() } as never,
      { getTransaction } as never,
      { execute: jest.fn() } as never,
    );

    await expect(useCase.execute('tx-1')).resolves.toBe(transaction);
    expect(getTransaction).not.toHaveBeenCalled();
  });

  it('returns pending transactions without syncing when no Wompi id exists', async () => {
    const localOnlyPendingTransaction = pendingTransaction.syncPayment({
      paymentStatus: 'PENDING',
      wompiTransactionId: null,
      paymentMethodType: null,
      paymentStatusMessage: null,
      cardBrand: null,
      cardLastFour: null,
    });
    const getTransaction = jest.fn();
    const useCase = new GetTransactionUseCase(
      {
        findById: jest.fn().mockResolvedValue(localOnlyPendingTransaction),
        save: jest.fn(),
      } as never,
      { getTransaction } as never,
      { execute: jest.fn() } as never,
    );

    await expect(useCase.execute('tx-1')).resolves.toBe(localOnlyPendingTransaction);
    expect(getTransaction).not.toHaveBeenCalled();
  });

  it('syncs pending transactions with Wompi', async () => {
    const save = jest.fn().mockImplementation(async (transaction) => transaction);
    const useCase = new GetTransactionUseCase(
      { findById: jest.fn().mockResolvedValue(pendingTransaction), save } as never,
      {
        getTransaction: jest.fn().mockResolvedValue({
          id: 'wompi-1',
          reference: 'tx-1',
          status: 'APPROVED',
          statusMessage: 'Approved',
          paymentMethodType: 'CARD',
          cardBrand: 'VISA',
          cardLastFour: '4242',
        }),
      } as never,
      { execute: jest.fn().mockImplementation(async (transaction) => transaction) } as never,
    );

    await expect(useCase.execute('tx-1')).resolves.toEqual(
      expect.objectContaining({ paymentStatus: 'APPROVED' }),
    );
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('keeps unknown Wompi statuses as pending', () => {
    const useCase = new GetTransactionUseCase(
      { findById: jest.fn(), save: jest.fn() } as never,
      { getTransaction: jest.fn() } as never,
      { execute: jest.fn() } as never,
    );

    expect((useCase as never).toPaymentStatus('PROCESSING')).toBe('PENDING');
  });

  it.each(['APPROVED', 'DECLINED', 'VOIDED', 'ERROR'] as const)(
    'keeps %s as a known Wompi payment status',
    (status) => {
      const useCase = new GetTransactionUseCase(
        { findById: jest.fn(), save: jest.fn() } as never,
        { getTransaction: jest.fn() } as never,
        { execute: jest.fn() } as never,
      );

      expect((useCase as never).toPaymentStatus(status)).toBe(status);
    },
  );
});
