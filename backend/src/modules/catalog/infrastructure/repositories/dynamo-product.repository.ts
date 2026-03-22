import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetCommand,
  PutCommand,
  ScanCommand,
  type DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import type { ProductRepositoryPort } from '../../application/ports/product-repository.port';
import { Product } from '../../domain/product.entity';
import { DYNAMODB_DOCUMENT_CLIENT } from '../../../../shared/infrastructure/dynamodb/dynamodb.constants';

type ProductRecord = {
  productId: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
  stock: number;
};

@Injectable()
export class DynamoProductRepository implements ProductRepositoryPort {
  private readonly tableName: string;

  constructor(
    @Inject(DYNAMODB_DOCUMENT_CLIENT)
    private readonly dynamoDbDocumentClient: DynamoDBDocumentClient,
    private readonly configService: ConfigService,
  ) {
    this.tableName =
      this.configService.get<string>('DYNAMODB_TABLE_PRODUCTS') ?? 'Products';
  }

  async list() {
    const response = await this.dynamoDbDocumentClient.send(
      new ScanCommand({
        TableName: this.tableName,
      }),
    );

    return (response.Items ?? []).map((item) =>
      this.toDomain(item as ProductRecord),
    );
  }

  async findById(productId: string) {
    const response = await this.dynamoDbDocumentClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { productId },
      }),
    );

    if (!response.Item) {
      return null;
    }

    return this.toDomain(response.Item as ProductRecord);
  }

  async save(product: Product) {
    await this.dynamoDbDocumentClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          productId: product.id,
          name: product.name,
          description: product.description,
          priceInCents: product.priceInCents,
          currency: product.currency,
          stock: product.stock,
        } satisfies ProductRecord,
      }),
    );

    return product;
  }

  private toDomain(record: ProductRecord) {
    return new Product(
      record.productId,
      record.name,
      record.description,
      record.priceInCents,
      record.currency,
      record.stock,
    );
  }
}
