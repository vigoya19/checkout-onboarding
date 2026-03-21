export type DeliveryStatus = 'PENDING' | 'READY' | 'DISPATCHED';

export class Delivery {
  constructor(
    readonly deliveryId: string,
    readonly transactionId: string,
    readonly customerEmail: string,
    readonly addressLine1: string,
    readonly city: string,
    readonly status: DeliveryStatus,
    readonly createdAt: string,
  ) {}
}
