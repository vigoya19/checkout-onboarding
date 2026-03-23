import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Transaction } from '../../domain/transaction.entity';
import { ProcessTransactionPaymentDto } from '../../dto/process-transaction-payment.dto';
import { ProcessTransactionPaymentUseCase } from './process-transaction-payment.use-case';

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

const payload = Object.assign(new ProcessTransactionPaymentDto(), {
  cardToken: 'card-token',
  acceptanceToken: 'acceptance-token',
  acceptPersonalAuthToken: 'personal-token',
  installments: 1,
});

describe('ProcessTransactionPaymentUseCase', () => {
  it('throws when the transaction does not exist', async () => {
    const useCase = new ProcessTransactionPaymentUseCase(
      { findById: jest.fn().mockResolvedValue(null), save: jest.fn() } as never,
      { createCardTransaction: jest.fn() } as never,
      { execute: jest.fn() } as never,
    );

    await expect(useCase.execute('missing', payload)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws when the transaction is already linked to Wompi', async () => {
    const linked = transaction.syncPayment({
      paymentStatus: 'PENDING',
      wompiTransactionId: 'wompi-1',
      paymentMethodType: null,
      paymentStatusMessage: null,
      cardBrand: null,
      cardLastFour: null,
    });
    const useCase = new ProcessTransactionPaymentUseCase(
      {
        findById: jest.fn().mockResolvedValue(linked),
        save: jest.fn(),
      } as never,
      { createCardTransaction: jest.fn() } as never,
      { execute: jest.fn() } as never,
    );

    await expect(useCase.execute('tx-1', payload)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('creates the payment transaction and persists the result', async () => {
    const save = jest.fn().mockImplementation(async (saved) => saved);
    const useCase = new ProcessTransactionPaymentUseCase(
      { findById: jest.fn().mockResolvedValue(transaction), save } as never,
      {
        createCardTransaction: jest.fn().mockResolvedValue({
          id: 'wompi-1',
          reference: 'tx-1',
          status: 'APPROVED',
          statusMessage: 'Approved',
          paymentMethodType: 'CARD',
          cardBrand: 'VISA',
          cardLastFour: '4242',
        }),
      } as never,
      {
        execute: jest.fn().mockImplementation(async (fulfilled) => fulfilled),
      } as never,
    );

    await expect(useCase.execute('tx-1', payload)).resolves.toEqual(
      expect.objectContaining({ wompiTransactionId: 'wompi-1' }),
    );
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('uses an explicit customer ip when it is provided', async () => {
    const save = jest.fn().mockImplementation(async (saved) => saved);
    const useCase = new ProcessTransactionPaymentUseCase(
      { findById: jest.fn().mockResolvedValue(transaction), save } as never,
      {
        createCardTransaction: jest.fn().mockResolvedValue({
          id: 'wompi-1',
          reference: 'tx-1',
          status: 'DECLINED',
          statusMessage: 'Declined',
          paymentMethodType: 'CARD',
          cardBrand: 'VISA',
          cardLastFour: '4242',
        }),
      } as never,
      {
        execute: jest.fn().mockImplementation(async (fulfilled) => fulfilled),
      } as never,
    );

    await useCase.execute(
      'tx-1',
      Object.assign(new ProcessTransactionPaymentDto(), payload, {
        customerIp: '192.168.0.10',
      }),
    );

    expect(
      (
        useCase['wompiGateway'] as {
          createCardTransaction: jest.Mock;
        }
      ).createCardTransaction.mock.calls[0][0].customerIp,
    ).toBe('192.168.0.10');
  });

  it('defaults unknown Wompi statuses to pending', () => {
    const useCase = new ProcessTransactionPaymentUseCase(
      { findById: jest.fn(), save: jest.fn() } as never,
      { createCardTransaction: jest.fn() } as never,
      { execute: jest.fn() } as never,
    );

    expect((useCase as never).toPaymentStatus('PROCESSING')).toBe('PENDING');
  });

  it.each(['APPROVED', 'DECLINED', 'VOIDED', 'ERROR'] as const)(
    'keeps %s as a known Wompi payment status',
    (status) => {
      const useCase = new ProcessTransactionPaymentUseCase(
        { findById: jest.fn(), save: jest.fn() } as never,
        { createCardTransaction: jest.fn() } as never,
        { execute: jest.fn() } as never,
      );

      expect((useCase as never).toPaymentStatus(status)).toBe(status);
    },
  );
});
