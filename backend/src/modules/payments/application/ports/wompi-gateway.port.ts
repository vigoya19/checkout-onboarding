export const WOMPI_GATEWAY = Symbol('WOMPI_GATEWAY');

export type WompiAcceptanceTokens = {
  acceptanceToken: string;
  acceptancePermalink: string | null;
  acceptPersonalAuthToken: string | null;
  acceptPersonalAuthPermalink: string | null;
};

export type CreateWompiCardTransactionInput = {
  reference: string;
  amountInCents: number;
  currency: 'COP';
  customerEmail: string;
  cardToken: string;
  acceptanceToken: string;
  acceptPersonalAuthToken?: string;
  customerIp: string;
  installments: number;
};

export type WompiTransactionSnapshot = {
  id: string;
  reference: string;
  status: string;
  statusMessage: string;
  paymentMethodType: string | null;
  cardBrand: string | null;
  cardLastFour: string | null;
};

export type WompiWebhookPayload = {
  event: string;
  data: {
    transaction?: {
      id: string;
      amount_in_cents: number;
      reference: string;
      customer_email: string;
      currency: string;
      payment_method_type?: string | null;
      status: string;
    };
  };
  signature?: {
    properties: string[];
    checksum: string;
  };
  timestamp?: number;
  sent_at?: string;
};

export interface WompiGatewayPort {
  getAcceptanceTokens(): Promise<WompiAcceptanceTokens>;
  createCardTransaction(
    input: CreateWompiCardTransactionInput,
  ): Promise<WompiTransactionSnapshot>;
  getTransaction(transactionId: string): Promise<WompiTransactionSnapshot>;
  verifyWebhookSignature(payload: WompiWebhookPayload): boolean;
}
