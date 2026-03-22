import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import {
  WompiWebhookDataDto,
  WompiWebhookDto,
  WompiWebhookSignatureDto,
  WompiWebhookTransactionDto,
} from './wompi-webhook.dto';

describe('WompiWebhookDto', () => {
  it('maps nested transaction payloads', () => {
    const dto = plainToInstance(WompiWebhookDto, {
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
        properties: ['transaction.id'],
        checksum: 'checksum',
      },
      timestamp: 1234567890,
    });

    expect(dto.data).toBeInstanceOf(WompiWebhookDataDto);
  });

  it('maps nested transaction objects', () => {
    const dto = plainToInstance(WompiWebhookDto, {
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
    });

    expect(dto.data.transaction).toBeInstanceOf(WompiWebhookTransactionDto);
  });

  it('maps nested signature objects', () => {
    const dto = plainToInstance(WompiWebhookDto, {
      event: 'transaction.updated',
      data: {},
      signature: {
        properties: ['transaction.id'],
        checksum: 'checksum',
      },
    });

    expect(dto.signature).toBeInstanceOf(WompiWebhookSignatureDto);
  });
});
