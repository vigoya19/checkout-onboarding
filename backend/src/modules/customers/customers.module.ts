import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepositoryPort,
} from './application/ports/customer-repository.port';
import { DynamoCustomerRepository } from './infrastructure/repositories/dynamo-customer.repository';
import { InMemoryCustomerRepository } from './infrastructure/repositories/in-memory-customer.repository';
import { DynamoDbModule } from '../../shared/infrastructure/dynamodb/dynamodb.module';

@Module({
  imports: [DynamoDbModule],
  providers: [
    InMemoryCustomerRepository,
    DynamoCustomerRepository,
    {
      provide: CUSTOMER_REPOSITORY,
      inject: [
        ConfigService,
        DynamoCustomerRepository,
        InMemoryCustomerRepository,
      ],
      useFactory: (
        configService: ConfigService,
        dynamoRepository: DynamoCustomerRepository,
        inMemoryRepository: InMemoryCustomerRepository,
      ): CustomerRepositoryPort =>
        configService.get<string>('USE_DYNAMODB') === 'true'
          ? dynamoRepository
          : inMemoryRepository,
    },
  ],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomersModule {}
