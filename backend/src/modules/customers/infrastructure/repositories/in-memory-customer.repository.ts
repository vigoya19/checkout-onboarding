import { Injectable } from '@nestjs/common';
import type { CustomerRepositoryPort } from '../../application/ports/customer-repository.port';
import type { Customer } from '../../domain/customer.entity';

@Injectable()
export class InMemoryCustomerRepository implements CustomerRepositoryPort {
  private readonly customers = new Map<string, Customer>();

  create(customer: Customer) {
    this.customers.set(customer.email, customer);

    return Promise.resolve(customer);
  }

  findByEmail(email: string) {
    return Promise.resolve(this.customers.get(email) ?? null);
  }
}
