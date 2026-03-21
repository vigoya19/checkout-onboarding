import type { Delivery } from '../../domain/delivery.entity';

export const DELIVERY_REPOSITORY = Symbol('DELIVERY_REPOSITORY');

export interface DeliveryRepositoryPort {
  create(delivery: Delivery): Promise<Delivery>;
  findByTransactionId(transactionId: string): Promise<Delivery | null>;
}
