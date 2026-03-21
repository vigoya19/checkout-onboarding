import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateCheckoutSessionUseCase } from './application/use-cases/create-checkout-session.use-case';
import { GetCheckoutSessionUseCase } from './application/use-cases/get-checkout-session.use-case';
import {
  CHECKOUT_SESSION_REPOSITORY,
  type CheckoutSessionRepositoryPort,
} from './application/ports/checkout-session-repository.port';
import { CheckoutController } from './checkout.controller';
import { DynamoCheckoutSessionRepository } from './infrastructure/repositories/dynamo-checkout-session.repository';
import { InMemoryCheckoutSessionRepository } from './infrastructure/repositories/in-memory-checkout-session.repository';
import { DynamoDbModule } from '../../shared/infrastructure/dynamodb/dynamodb.module';

@Module({
  imports: [DynamoDbModule],
  controllers: [CheckoutController],
  providers: [
    CreateCheckoutSessionUseCase,
    GetCheckoutSessionUseCase,
    InMemoryCheckoutSessionRepository,
    DynamoCheckoutSessionRepository,
    {
      provide: CHECKOUT_SESSION_REPOSITORY,
      inject: [
        ConfigService,
        DynamoCheckoutSessionRepository,
        InMemoryCheckoutSessionRepository,
      ],
      useFactory: (
        configService: ConfigService,
        dynamoRepository: DynamoCheckoutSessionRepository,
        inMemoryRepository: InMemoryCheckoutSessionRepository,
      ): CheckoutSessionRepositoryPort =>
        configService.get<string>('USE_DYNAMODB') === 'true'
          ? dynamoRepository
          : inMemoryRepository,
    },
  ],
})
export class CheckoutModule {}
