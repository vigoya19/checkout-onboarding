import { BadRequestException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Transaction } from '../../domain/transaction.entity';
import { WompiWebhookDto } from '../../dto/wompi-webhook.dto';
import { HandleWompiWebhookUseCase } from './handle-wompi-webhook.use-case';

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

describe('HandleWompiWebhookUseCase', () => {
  it('ignores unsupported events', async () => {
    const useCase = new HandleWompiWebhookUseCase(
      { findById: jest.fn(), save: jest.fn() } as never,
      { verifyWebhookSignature: jest.fn() } as never,
      { execute: jest.fn() } as never,
    );

    await expect(
      useCase.execute({ event: 'other.event' } as never),
    ).resolves.toEqual({ received: true, ignored: true });
  });

  it('rejects invalid signatures', async () => {
    const useCase = new HandleWompiWebhookUseCase(
      { findById: jest.fn(), save: jest.fn() } as never,
      { verifyWebhookSignature: jest.fn().mockReturnValue(false) } as never,
      { execute: jest.fn() } as never,
    );

    await expect(
      useCase.execute({ event: 'transaction.updated', data: {} } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects payloads without a transaction object', async () => {
    const useCase = new HandleWompiWebhookUseCase(
      { findById: jest.fn(), save: jest.fn() } as never,
      { verifyWebhookSignature: jest.fn().mockReturnValue(true) } as never,
      { execute: jest.fn() } as never,
    );

    await expect(
      useCase.execute({ event: 'transaction.updated', data: {} } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when the local transaction is missing', async () => {
    const useCase = new HandleWompiWebhookUseCase(
      { findById: jest.fn().mockResolvedValue(null), save: jest.fn() } as never,
      { verifyWebhookSignature: jest.fn().mockReturnValue(true) } as never,
      { execute: jest.fn() } as never,
    );
    const payload = plainToInstance(WompiWebhookDto, {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: 'wompi-1',
          amount_in_cents: 1000,
          reference: 'tx-1',
          customer_email: 'jane@example.com',
          currency: 'COP',
          status: 'APPROVED',
        },
      },
      signature: {
        properties: [],
        checksum: 'checksum',
      },
    });

    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('persists the webhook update', async () => {
    const save = jest.fn().mockImplementation(async (saved) => saved);
    const useCase = new HandleWompiWebhookUseCase(
      { findById: jest.fn().mockResolvedValue(transaction), save } as never,
      { verifyWebhookSignature: jest.fn().mockReturnValue(true) } as never,
      { execute: jest.fn().mockImplementation(async (fulfilled) => fulfilled) } as never,
    );
    const payload = plainToInstance(WompiWebhookDto, {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: 'wompi-2',
          amount_in_cents: 1000,
          reference: 'tx-1',
          customer_email: 'jane@example.com',
          currency: 'COP',
          status: 'APPROVED',
        },
      },
      signature: {
        properties: [],
        checksum: 'checksum',
      },
    });

    await expect(useCase.execute(payload)).resolves.toEqual({ received: true });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('uses unknown when the webhook timestamp is missing', async () => {
    const save = jest.fn().mockImplementation(async (saved) => saved);
    const useCase = new HandleWompiWebhookUseCase(
      { findById: jest.fn().mockResolvedValue(transaction), save } as never,
      { verifyWebhookSignature: jest.fn().mockReturnValue(true) } as never,
      { execute: jest.fn().mockImplementation(async (fulfilled) => fulfilled) } as never,
    );
    const payload = plainToInstance(WompiWebhookDto, {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: 'wompi-2',
          amount_in_cents: 1000,
          reference: 'tx-1',
          customer_email: 'jane@example.com',
          currency: 'COP',
          status: 'APPROVED',
        },
      },
      signature: {
        properties: [],
        checksum: 'checksum',
      },
    });

    await useCase.execute(payload);

    expect(save.mock.calls[0][0].paymentStatusMessage).toContain('unknown');
  });

  it('defaults unknown Wompi statuses to pending', () => {
    const useCase = new HandleWompiWebhookUseCase(
      { findById: jest.fn(), save: jest.fn() } as never,
      { verifyWebhookSignature: jest.fn() } as never,
      { execute: jest.fn() } as never,
    );

    expect((useCase as never).toPaymentStatus('PROCESSING')).toBe('PENDING');
  });

  it.each(['APPROVED', 'DECLINED', 'VOIDED', 'ERROR'] as const)(
    'keeps %s as a known Wompi payment status',
    (status) => {
      const useCase = new HandleWompiWebhookUseCase(
        { findById: jest.fn(), save: jest.fn() } as never,
        { verifyWebhookSignature: jest.fn() } as never,
        { execute: jest.fn() } as never,
      );

      expect((useCase as never).toPaymentStatus(status)).toBe(status);
    },
  );
});
