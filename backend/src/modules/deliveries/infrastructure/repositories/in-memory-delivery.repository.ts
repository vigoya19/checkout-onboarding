import { Injectable } from '@nestjs/common';
import type { DeliveryRepositoryPort } from '../../application/ports/delivery-repository.port';
import type { Delivery } from '../../domain/delivery.entity';

@Injectable()
export class InMemoryDeliveryRepository implements DeliveryRepositoryPort {
  private readonly deliveries = new Map<string, Delivery>();

  create(delivery: Delivery) {
    this.deliveries.set(delivery.transactionId, delivery);

    return Promise.resolve(delivery);
  }

  findByTransactionId(transactionId: string) {
    return Promise.resolve(this.deliveries.get(transactionId) ?? null);
  }
}
