import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DYNAMODB_DOCUMENT_CLIENT } from './dynamodb.constants';

@Module({
  providers: [
    {
      provide: DYNAMODB_DOCUMENT_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const client = new DynamoDBClient({
          region: configService.get<string>('AWS_REGION') ?? 'us-east-1',
        });

        return DynamoDBDocumentClient.from(client, {
          marshallOptions: {
            removeUndefinedValues: true,
          },
        });
      },
    },
  ],
  exports: [DYNAMODB_DOCUMENT_CLIENT],
})
export class DynamoDbModule {}
