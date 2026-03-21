export class CheckoutSession {
  constructor(
    readonly sessionId: string,
    readonly productId: string,
    readonly currentStep: number,
    readonly customerEmail: string,
    readonly createdAt: string,
  ) {}
}
