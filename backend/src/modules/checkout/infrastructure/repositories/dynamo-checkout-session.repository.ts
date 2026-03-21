import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetCommand,
  PutCommand,
  type DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import type { CheckoutSessionRepositoryPort } from '../../application/ports/checkout-session-repository.port';
import { CheckoutSession } from '../../domain/checkout-session.entity';
import { DYNAMODB_DOCUMENT_CLIENT } from '../../../../shared/infrastructure/dynamodb/dynamodb.constants';

type CheckoutSessionRecord = {
  sessionId: string;
  productId: string;
  currentStep: number;
  customerEmail: string;
  createdAt: string;
};

@Injectable()
export class DynamoCheckoutSessionRepository implements CheckoutSessionRepositoryPort {
  private readonly tableName: string;

  constructor(
    @Inject(DYNAMODB_DOCUMENT_CLIENT)
    private readonly dynamoDbDocumentClient: DynamoDBDocumentClient,
    private readonly configService: ConfigService,
  ) {
    this.tableName =
      this.configService.get<string>('DYNAMODB_TABLE_CHECKOUT_SESSIONS') ??
      'CheckoutSessions';
  }

  async create(session: CheckoutSession) {
    await this.dynamoDbDocumentClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          sessionId: session.sessionId,
          productId: session.productId,
          currentStep: session.currentStep,
          customerEmail: session.customerEmail,
          createdAt: session.createdAt,
        } satisfies CheckoutSessionRecord,
      }),
    );

    return session;
  }

  async findById(sessionId: string) {
    const response = await this.dynamoDbDocumentClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { sessionId },
      }),
    );

    if (!response.Item) {
      return null;
    }

    return this.toDomain(response.Item as CheckoutSessionRecord);
  }

  private toDomain(record: CheckoutSessionRecord) {
    return new CheckoutSession(
      record.sessionId,
      record.productId,
      record.currentStep,
      record.customerEmail,
      record.createdAt,
    );
  }
}
