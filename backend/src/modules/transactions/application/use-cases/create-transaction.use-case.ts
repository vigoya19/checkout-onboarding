import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  type ProductRepositoryPort,
} from '../../../catalog/application/ports/product-repository.port';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from '../ports/transaction-repository.port';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { Transaction } from '../../domain/transaction.entity';

@Injectable()
export class CreateTransactionUseCase {
  private readonly logger = new Logger(CreateTransactionUseCase.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(payload: CreateTransactionDto) {
    const product = await this.productRepository.findById(payload.productId);

    if (!product) {
      throw new NotFoundException(`Product ${payload.productId} was not found`);
    }

    if (product.stock <= 0) {
      throw new BadRequestException(
        `Product ${payload.productId} is out of stock`,
      );
    }

    const transactionId = randomUUID();

    this.logger.log(
      `Creating local transaction ${transactionId} for product ${payload.productId} and customer ${payload.customerEmail}`,
    );

    const transaction = new Transaction(
      transactionId,
      transactionId,
      payload.productId,
      payload.customerName,
      payload.customerEmail,
      payload.customerPhone,
      payload.addressLine1,
      payload.city,
      payload.department,
      payload.amountInCents,
      payload.baseFeeInCents,
      payload.deliveryFeeInCents,
      'PENDING',
      'NOT_STARTED',
      new Date().toISOString(),
    );

    return this.transactionRepository.create(transaction);
  }
}
