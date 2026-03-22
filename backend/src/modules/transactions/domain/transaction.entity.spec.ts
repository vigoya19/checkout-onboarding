import { Transaction } from './transaction.entity';

describe('Transaction', () => {
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

  it('creates a new instance when payment data changes', () => {
    const updated = transaction.syncPayment({
      paymentStatus: 'APPROVED',
      wompiTransactionId: 'wompi-1',
      paymentMethodType: 'CARD',
      paymentStatusMessage: 'Approved',
      cardBrand: 'VISA',
      cardLastFour: '4242',
    });

    expect(updated).not.toBe(transaction);
  });

  it('updates payment fields', () => {
    const updated = transaction.syncPayment({
      paymentStatus: 'APPROVED',
      wompiTransactionId: 'wompi-1',
      paymentMethodType: 'CARD',
      paymentStatusMessage: 'Approved',
      cardBrand: 'VISA',
      cardLastFour: '4242',
    });

    expect(updated.paymentStatus).toBe('APPROVED');
  });

  it('creates a new instance when fulfillment changes', () => {
    const updated = transaction.syncFulfillment({
      fulfillmentStatus: 'COMPLETED',
    });

    expect(updated).not.toBe(transaction);
  });

  it('updates fulfillment fields', () => {
    const updated = transaction.syncFulfillment({
      fulfillmentStatus: 'COMPLETED',
    });

    expect(updated.fulfillmentStatus).toBe('COMPLETED');
  });
});

