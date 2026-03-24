export class Product {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string,
    readonly features: string[],
    readonly priceInCents: number,
    readonly currency: string,
    readonly stock: number,
  ) {}

  updateStock(stock: number) {
    return new Product(
      this.id,
      this.name,
      this.description,
      this.features,
      this.priceInCents,
      this.currency,
      stock,
    );
  }
}
