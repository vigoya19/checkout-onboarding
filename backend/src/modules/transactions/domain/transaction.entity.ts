export type PaymentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
export type FulfillmentStatus = 'NOT_STARTED' | 'COMPLETED' | 'FAILED';

export class Transaction {
  constructor(
    readonly transactionId: string,
    readonly productId: string,
    readonly customerEmail: string,
    readonly amountInCents: number,
    readonly baseFeeInCents: number,
    readonly deliveryFeeInCents: number,
    readonly paymentStatus: PaymentStatus,
    readonly fulfillmentStatus: FulfillmentStatus,
    readonly createdAt: string,
  ) {}
}
