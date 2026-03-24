export const ASSISTANT_CLIENT = Symbol('ASSISTANT_CLIENT');

export type AssistantRequest = {
  message: string;
  productId?: string;
  productName?: string;
  productDescription?: string;
  features?: string[];
  stock?: number;
  currentStep?: number;
  priceInCents?: number;
  baseFeeInCents?: number;
  deliveryFeeInCents?: number;
  currency?: 'COP';
};

export interface AssistantClientPort {
  answer(input: AssistantRequest): Promise<string>;
}
