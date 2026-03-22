import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  type ProductRepositoryPort,
} from '../../../catalog/application/ports/product-repository.port';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepositoryPort,
} from '../../../customers/application/ports/customer-repository.port';
import { Customer } from '../../../customers/domain/customer.entity';
import {
  DELIVERY_REPOSITORY,
  type DeliveryRepositoryPort,
} from '../../../deliveries/application/ports/delivery-repository.port';
import { Delivery } from '../../../deliveries/domain/delivery.entity';
import { Transaction } from '../../domain/transaction.entity';

@Injectable()
export class FulfillApprovedTransactionUseCase {
  private readonly logger = new Logger(FulfillApprovedTransactionUseCase.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  async execute(transaction: Transaction) {
    if (transaction.paymentStatus !== 'APPROVED') {
      return transaction;
    }

    if (transaction.fulfillmentStatus === 'COMPLETED') {
      return transaction;
    }

    const product = await this.productRepository.findById(
      transaction.productId,
    );

    if (!product || product.stock <= 0) {
      this.logger.warn(
        `Unable to fulfill transaction ${transaction.transactionId}: product ${transaction.productId} is not available`,
      );

      return transaction.syncFulfillment({
        fulfillmentStatus: 'FAILED',
      });
    }

    const existingCustomer = await this.customerRepository.findByEmail(
      transaction.customerEmail,
    );

    if (!existingCustomer) {
      await this.customerRepository.create(
        new Customer(
          randomUUID(),
          transaction.customerName,
          transaction.customerEmail,
          transaction.customerPhone,
          new Date().toISOString(),
        ),
      );
    }

    const existingDelivery = await this.deliveryRepository.findByTransactionId(
      transaction.transactionId,
    );

    if (!existingDelivery) {
      await this.deliveryRepository.create(
        new Delivery(
          randomUUID(),
          transaction.transactionId,
          transaction.customerEmail,
          `${transaction.addressLine1}, ${transaction.department}`,
          transaction.city,
          'PENDING',
          new Date().toISOString(),
        ),
      );
    }

    await this.productRepository.save(product.updateStock(product.stock - 1));

    this.logger.log(
      `Transaction ${transaction.transactionId} fulfilled. Product ${transaction.productId} stock decremented to ${product.stock - 1}`,
    );

    return transaction.syncFulfillment({
      fulfillmentStatus: 'COMPLETED',
    });
  }
}
