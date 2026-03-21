import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetCommand,
  PutCommand,
  type DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import type { DeliveryRepositoryPort } from '../../application/ports/delivery-repository.port';
import { Delivery, type DeliveryStatus } from '../../domain/delivery.entity';
import { DYNAMODB_DOCUMENT_CLIENT } from '../../../../shared/infrastructure/dynamodb/dynamodb.constants';

type DeliveryRecord = {
  deliveryId: string;
  transactionId: string;
  customerEmail: string;
  addressLine1: string;
  city: string;
  status: DeliveryStatus;
  createdAt: string;
};

@Injectable()
export class DynamoDeliveryRepository implements DeliveryRepositoryPort {
  private readonly tableName: string;

  constructor(
    @Inject(DYNAMODB_DOCUMENT_CLIENT)
    private readonly dynamoDbDocumentClient: DynamoDBDocumentClient,
    private readonly configService: ConfigService,
  ) {
    this.tableName =
      this.configService.get<string>('DYNAMODB_TABLE_DELIVERIES') ??
      'Deliveries';
  }

  async create(delivery: Delivery) {
    await this.dynamoDbDocumentClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          deliveryId: delivery.deliveryId,
          transactionId: delivery.transactionId,
          customerEmail: delivery.customerEmail,
          addressLine1: delivery.addressLine1,
          city: delivery.city,
          status: delivery.status,
          createdAt: delivery.createdAt,
        } satisfies DeliveryRecord,
      }),
    );

    return delivery;
  }

  async findByTransactionId(transactionId: string) {
    const response = await this.dynamoDbDocumentClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { transactionId },
      }),
    );

    if (!response.Item) {
      return null;
    }

    const record = response.Item as DeliveryRecord;

    return new Delivery(
      record.deliveryId,
      record.transactionId,
      record.customerEmail,
      record.addressLine1,
      record.city,
      record.status,
      record.createdAt,
    );
  }
}
