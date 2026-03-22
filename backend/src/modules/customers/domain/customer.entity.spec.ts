import { Customer } from './customer.entity';

describe('Customer', () => {
  it('stores the provided customer data', () => {
    const customer = new Customer(
      'customer-1',
      'Jane Doe',
      'jane@example.com',
      '3001234567',
      '2025-01-01T00:00:00.000Z',
    );

    expect(customer.email).toBe('jane@example.com');
  });
});

