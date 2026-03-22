import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from '../ports/transaction-repository.port';
import {
  WOMPI_GATEWAY,
  type WompiGatewayPort,
} from '../../../payments/application/ports/wompi-gateway.port';
import type { PaymentStatus } from '../../domain/transaction.entity';
import { FulfillApprovedTransactionUseCase } from './fulfill-approved-transaction.use-case';

@Injectable()
export class GetTransactionUseCase {
  private readonly logger = new Logger(GetTransactionUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(WOMPI_GATEWAY)
    private readonly wompiGateway: WompiGatewayPort,
    private readonly fulfillApprovedTransactionUseCase: FulfillApprovedTransactionUseCase,
  ) {}

  async execute(transactionId: string) {
    this.logger.log(`Fetching transaction ${transactionId}`);

    const transaction =
      await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      throw new NotFoundException(`Transaction ${transactionId} was not found`);
    }

    if (
      transaction.paymentStatus !== 'PENDING' ||
      !transaction.wompiTransactionId
    ) {
      this.logger.log(
        `Transaction ${transactionId} returned without Wompi sync. Status: ${transaction.paymentStatus}`,
      );
      return transaction;
    }

    this.logger.log(
      `Syncing pending transaction ${transactionId} with Wompi transaction ${transaction.wompiTransactionId}`,
    );

    const wompiTransaction = await this.wompiGateway.getTransaction(
      transaction.wompiTransactionId,
    );

    const updatedTransaction = transaction.syncPayment({
      paymentStatus: this.toPaymentStatus(wompiTransaction.status),
      wompiTransactionId: wompiTransaction.id,
      paymentMethodType: wompiTransaction.paymentMethodType,
      paymentStatusMessage: wompiTransaction.statusMessage,
      cardBrand: wompiTransaction.cardBrand,
      cardLastFour: wompiTransaction.cardLastFour,
    });

    const fulfilledTransaction =
      await this.fulfillApprovedTransactionUseCase.execute(updatedTransaction);

    this.logger.log(
      `Transaction ${transactionId} synced from Wompi with status ${fulfilledTransaction.paymentStatus} / ${fulfilledTransaction.fulfillmentStatus}`,
    );

    return this.transactionRepository.save(fulfilledTransaction);
  }

  private toPaymentStatus(status: string): PaymentStatus {
    if (
      status === 'APPROVED' ||
      status === 'DECLINED' ||
      status === 'VOIDED' ||
      status === 'ERROR'
    ) {
      return status;
    }

    return 'PENDING';
  }
}
