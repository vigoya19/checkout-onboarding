import { Customer } from '../../domain/customer.entity';
import { InMemoryCustomerRepository } from './in-memory-customer.repository';

describe('InMemoryCustomerRepository', () => {
  it('returns null for an unknown customer', async () => {
    const repository = new InMemoryCustomerRepository();

    await expect(
      repository.findByEmail('missing@example.com'),
    ).resolves.toBeNull();
  });

  it('stores and retrieves a customer', async () => {
    const repository = new InMemoryCustomerRepository();
    const customer = new Customer(
      'customer-1',
      'Jane Doe',
      'jane@example.com',
      '3001234567',
      '2025-01-01T00:00:00.000Z',
    );

    await repository.create(customer);

    await expect(repository.findByEmail('jane@example.com')).resolves.toBe(
      customer,
    );
  });
});
