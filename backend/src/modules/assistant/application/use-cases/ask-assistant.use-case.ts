import { Inject, Injectable } from '@nestjs/common';
import {
  ASSISTANT_CLIENT,
  type AssistantClientPort,
  type AssistantRequest,
} from '../ports/assistant-client.port';
import {
  PRODUCT_REPOSITORY,
  type ProductRepositoryPort,
} from '../../../catalog/application/ports/product-repository.port';

@Injectable()
export class AskAssistantUseCase {
  constructor(
    @Inject(ASSISTANT_CLIENT)
    private readonly assistantClient: AssistantClientPort,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(input: AssistantRequest) {
    const enrichedInput = await this.enrichWithProductContext(input);

    return this.assistantClient.answer(enrichedInput);
  }

  private async enrichWithProductContext(input: AssistantRequest) {
    if (!input.productId) {
      return input;
    }

    const product = await this.productRepository.findById(input.productId);

    if (!product) {
      return input;
    }

    return {
      ...input,
      productName: product.name,
      productDescription: product.description,
      features: product.features,
      stock: product.stock,
      priceInCents: product.priceInCents,
      currency: product.currency === 'COP' ? 'COP' : input.currency,
    } satisfies AssistantRequest;
  }
}
