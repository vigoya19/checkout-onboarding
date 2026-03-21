import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetCommand,
  PutCommand,
  type DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import type { TransactionRepositoryPort } from '../../application/ports/transaction-repository.port';
import {
  Transaction,
  type FulfillmentStatus,
  type PaymentStatus,
} from '../../domain/transaction.entity';
import { DYNAMODB_DOCUMENT_CLIENT } from '../../../../shared/infrastructure/dynamodb/dynamodb.constants';

type TransactionRecord = {
  transactionId: string;
  reference: string;
  productId: string;
  customerEmail: string;
  amountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  createdAt: string;
  wompiTransactionId?: string | null;
  paymentMethodType?: string | null;
  paymentStatusMessage?: string | null;
  cardBrand?: string | null;
  cardLastFour?: string | null;
};

@Injectable()
export class DynamoTransactionRepository implements TransactionRepositoryPort {
  private readonly tableName: string;

  constructor(
    @Inject(DYNAMODB_DOCUMENT_CLIENT)
    private readonly dynamoDbDocumentClient: DynamoDBDocumentClient,
    private readonly configService: ConfigService,
  ) {
    this.tableName =
      this.configService.get<string>('DYNAMODB_TABLE_TRANSACTIONS') ??
      'Transactions';
  }

  async create(transaction: Transaction) {
    return this.save(transaction);
  }

  async findById(transactionId: string) {
    const response = await this.dynamoDbDocumentClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { transactionId },
      }),
    );

    if (!response.Item) {
      return null;
    }

    return this.toDomain(response.Item as TransactionRecord);
  }

  private toDomain(record: TransactionRecord) {
    return new Transaction(
      record.transactionId,
      record.reference,
      record.productId,
      record.customerEmail,
      record.amountInCents,
      record.baseFeeInCents,
      record.deliveryFeeInCents,
      record.paymentStatus,
      record.fulfillmentStatus,
      record.createdAt,
      record.wompiTransactionId ?? null,
      record.paymentMethodType ?? null,
      record.paymentStatusMessage ?? null,
      record.cardBrand ?? null,
      record.cardLastFour ?? null,
    );
  }

  async save(transaction: Transaction) {
    await this.dynamoDbDocumentClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          transactionId: transaction.transactionId,
          reference: transaction.reference,
          productId: transaction.productId,
          customerEmail: transaction.customerEmail,
          amountInCents: transaction.amountInCents,
          baseFeeInCents: transaction.baseFeeInCents,
          deliveryFeeInCents: transaction.deliveryFeeInCents,
          paymentStatus: transaction.paymentStatus,
          fulfillmentStatus: transaction.fulfillmentStatus,
          createdAt: transaction.createdAt,
          wompiTransactionId: transaction.wompiTransactionId,
          paymentMethodType: transaction.paymentMethodType,
          paymentStatusMessage: transaction.paymentStatusMessage,
          cardBrand: transaction.cardBrand,
          cardLastFour: transaction.cardLastFour,
        } satisfies TransactionRecord,
      }),
    );

    return transaction;
  }
}
