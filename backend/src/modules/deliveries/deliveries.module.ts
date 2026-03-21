import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DELIVERY_REPOSITORY,
  type DeliveryRepositoryPort,
} from './application/ports/delivery-repository.port';
import { DynamoDeliveryRepository } from './infrastructure/repositories/dynamo-delivery.repository';
import { InMemoryDeliveryRepository } from './infrastructure/repositories/in-memory-delivery.repository';
import { DynamoDbModule } from '../../shared/infrastructure/dynamodb/dynamodb.module';

@Module({
  imports: [DynamoDbModule],
  providers: [
    InMemoryDeliveryRepository,
    DynamoDeliveryRepository,
    {
      provide: DELIVERY_REPOSITORY,
      inject: [
        ConfigService,
        DynamoDeliveryRepository,
        InMemoryDeliveryRepository,
      ],
      useFactory: (
        configService: ConfigService,
        dynamoRepository: DynamoDeliveryRepository,
        inMemoryRepository: InMemoryDeliveryRepository,
      ): DeliveryRepositoryPort =>
        configService.get<string>('USE_DYNAMODB') === 'true'
          ? dynamoRepository
          : inMemoryRepository,
    },
  ],
  exports: [DELIVERY_REPOSITORY],
})
export class DeliveriesModule {}
