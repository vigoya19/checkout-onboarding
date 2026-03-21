import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetCommand,
  PutCommand,
  type DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import type { CustomerRepositoryPort } from '../../application/ports/customer-repository.port';
import { Customer } from '../../domain/customer.entity';
import { DYNAMODB_DOCUMENT_CLIENT } from '../../../../shared/infrastructure/dynamodb/dynamodb.constants';

type CustomerRecord = {
  customerId: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
};

@Injectable()
export class DynamoCustomerRepository implements CustomerRepositoryPort {
  private readonly tableName: string;

  constructor(
    @Inject(DYNAMODB_DOCUMENT_CLIENT)
    private readonly dynamoDbDocumentClient: DynamoDBDocumentClient,
    private readonly configService: ConfigService,
  ) {
    this.tableName =
      this.configService.get<string>('DYNAMODB_TABLE_CUSTOMERS') ?? 'Customers';
  }

  async create(customer: Customer) {
    await this.dynamoDbDocumentClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          customerId: customer.customerId,
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
          createdAt: customer.createdAt,
        } satisfies CustomerRecord,
      }),
    );

    return customer;
  }

  async findByEmail(email: string) {
    const response = await this.dynamoDbDocumentClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { email },
      }),
    );

    if (!response.Item) {
      return null;
    }

    const record = response.Item as CustomerRecord;

    return new Customer(
      record.customerId,
      record.fullName,
      record.email,
      record.phone,
      record.createdAt,
    );
  }
}
