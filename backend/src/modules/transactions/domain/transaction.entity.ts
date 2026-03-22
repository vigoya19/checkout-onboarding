export type PaymentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'VOIDED'
  | 'ERROR';
export type FulfillmentStatus = 'NOT_STARTED' | 'COMPLETED' | 'FAILED';

export class Transaction {
  constructor(
    readonly transactionId: string,
    readonly reference: string,
    readonly productId: string,
    readonly customerName: string,
    readonly customerEmail: string,
    readonly customerPhone: string,
    readonly addressLine1: string,
    readonly city: string,
    readonly department: string,
    readonly amountInCents: number,
    readonly baseFeeInCents: number,
    readonly deliveryFeeInCents: number,
    readonly paymentStatus: PaymentStatus,
    readonly fulfillmentStatus: FulfillmentStatus,
    readonly createdAt: string,
    readonly wompiTransactionId: string | null = null,
    readonly paymentMethodType: string | null = null,
    readonly paymentStatusMessage: string | null = null,
    readonly cardBrand: string | null = null,
    readonly cardLastFour: string | null = null,
  ) {}

  syncPayment(payload: {
    paymentStatus: PaymentStatus;
    wompiTransactionId: string | null;
    paymentMethodType: string | null;
    paymentStatusMessage: string | null;
    cardBrand: string | null;
    cardLastFour: string | null;
  }) {
    return new Transaction(
      this.transactionId,
      this.reference,
      this.productId,
      this.customerName,
      this.customerEmail,
      this.customerPhone,
      this.addressLine1,
      this.city,
      this.department,
      this.amountInCents,
      this.baseFeeInCents,
      this.deliveryFeeInCents,
      payload.paymentStatus,
      this.fulfillmentStatus,
      this.createdAt,
      payload.wompiTransactionId,
      payload.paymentMethodType,
      payload.paymentStatusMessage,
      payload.cardBrand,
      payload.cardLastFour,
    );
  }

  syncFulfillment(payload: { fulfillmentStatus: FulfillmentStatus }) {
    return new Transaction(
      this.transactionId,
      this.reference,
      this.productId,
      this.customerName,
      this.customerEmail,
      this.customerPhone,
      this.addressLine1,
      this.city,
      this.department,
      this.amountInCents,
      this.baseFeeInCents,
      this.deliveryFeeInCents,
      this.paymentStatus,
      payload.fulfillmentStatus,
      this.createdAt,
      this.wompiTransactionId,
      this.paymentMethodType,
      this.paymentStatusMessage,
      this.cardBrand,
      this.cardLastFour,
    );
  }
}
