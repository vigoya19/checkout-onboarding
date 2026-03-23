import { MODULE_METADATA } from '@nestjs/common/constants';
import { ConfigService } from '@nestjs/config';
import { DYNAMODB_DOCUMENT_CLIENT } from './dynamodb.constants';
import { DynamoDbModule } from './dynamodb.module';

describe('DynamoDbModule', () => {
  it('exports the document client token', () => {
    const exportsMetadata = Reflect.getMetadata(
      MODULE_METADATA.EXPORTS,
      DynamoDbModule,
    );

    expect(exportsMetadata).toContain(DYNAMODB_DOCUMENT_CLIENT);
  });

  it('injects ConfigService in the provider factory', () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      DynamoDbModule,
    );
    const provider = providers[0] as {
      provide: symbol;
      inject: unknown[];
    };

    expect(provider.provide).toBe(DYNAMODB_DOCUMENT_CLIENT);
    expect(provider.inject).toEqual([ConfigService]);
  });

  it('uses the configured region', () => {
    jest.resetModules();
    const DynamoDBClientMock = jest.fn();
    const from = jest.fn(() => 'document-client');

    jest.doMock('@aws-sdk/client-dynamodb', () => ({
      DynamoDBClient: DynamoDBClientMock,
    }));
    jest.doMock('@aws-sdk/lib-dynamodb', () => ({
      DynamoDBDocumentClient: { from },
    }));

    jest.isolateModules(() => {
      const { DynamoDbModule: IsolatedModule } = require('./dynamodb.module');
      const providers = Reflect.getMetadata(
        MODULE_METADATA.PROVIDERS,
        IsolatedModule,
      );
      const provider = providers[0] as {
        useFactory: (configService: ConfigService) => unknown;
      };

      provider.useFactory({
        get: jest.fn().mockReturnValue('eu-west-1'),
      } as never);
    });

    expect(DynamoDBClientMock).toHaveBeenCalledWith({ region: 'eu-west-1' });
  });

  it('falls back to us-east-1 when the region is missing', () => {
    jest.resetModules();
    const DynamoDBClientMock = jest.fn();

    jest.doMock('@aws-sdk/client-dynamodb', () => ({
      DynamoDBClient: DynamoDBClientMock,
    }));
    jest.doMock('@aws-sdk/lib-dynamodb', () => ({
      DynamoDBDocumentClient: { from: jest.fn(() => 'document-client') },
    }));

    jest.isolateModules(() => {
      const { DynamoDbModule: IsolatedModule } = require('./dynamodb.module');
      const providers = Reflect.getMetadata(
        MODULE_METADATA.PROVIDERS,
        IsolatedModule,
      );
      const provider = providers[0] as {
        useFactory: (configService: ConfigService) => unknown;
      };

      provider.useFactory({
        get: jest.fn().mockReturnValue(undefined),
      } as never);
    });

    expect(DynamoDBClientMock).toHaveBeenCalledWith({ region: 'us-east-1' });
  });
});
