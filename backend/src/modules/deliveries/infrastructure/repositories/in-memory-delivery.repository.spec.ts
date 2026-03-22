import { Delivery } from '../../domain/delivery.entity';
import { InMemoryDeliveryRepository } from './in-memory-delivery.repository';

describe('InMemoryDeliveryRepository', () => {
  it('returns null for an unknown delivery', async () => {
    const repository = new InMemoryDeliveryRepository();

    await expect(repository.findByTransactionId('missing')).resolves.toBeNull();
  });

  it('stores and retrieves a delivery', async () => {
    const repository = new InMemoryDeliveryRepository();
    const delivery = new Delivery(
      'delivery-1',
      'tx-1',
      'jane@example.com',
      'Street 1',
      'Bogota',
      'PENDING',
      '2025-01-01T00:00:00.000Z',
    );

    await repository.create(delivery);

    await expect(repository.findByTransactionId('tx-1')).resolves.toBe(delivery);
  });
});

