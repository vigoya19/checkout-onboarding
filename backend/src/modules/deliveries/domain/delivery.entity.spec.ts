import { Delivery } from './delivery.entity';

describe('Delivery', () => {
  it('stores the provided delivery state', () => {
    const delivery = new Delivery(
      'delivery-1',
      'tx-1',
      'jane@example.com',
      'Street 1',
      'Bogota',
      'PENDING',
      '2025-01-01T00:00:00.000Z',
    );

    expect(delivery.status).toBe('PENDING');
  });
});
