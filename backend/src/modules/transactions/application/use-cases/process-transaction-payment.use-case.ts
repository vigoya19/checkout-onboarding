import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  WOMPI_GATEWAY,
  type WompiGatewayPort,
} from '../../../payments/application/ports/wompi-gateway.port';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from '../ports/transaction-repository.port';
import { ProcessTransactionPaymentDto } from '../../dto/process-transaction-payment.dto';
import type { PaymentStatus } from '../../domain/transaction.entity';
import { FulfillApprovedTransactionUseCase } from './fulfill-approved-transaction.use-case';

@Injectable()
export class ProcessTransactionPaymentUseCase {
  private readonly logger = new Logger(ProcessTransactionPaymentUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(WOMPI_GATEWAY)
    private readonly wompiGateway: WompiGatewayPort,
    private readonly fulfillApprovedTransactionUseCase: FulfillApprovedTransactionUseCase,
  ) {}

  async execute(transactionId: string, payload: ProcessTransactionPaymentDto) {
    this.logger.log(`Processing payment for transaction ${transactionId}`);

    const transaction =
      await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      throw new NotFoundException(`Transaction ${transactionId} was not found`);
    }

    if (transaction.wompiTransactionId) {
      throw new BadRequestException(
        `Transaction ${transactionId} is already linked to Wompi`,
      );
    }

    const wompiTransaction = await this.wompiGateway.createCardTransaction({
      reference: transaction.reference,
      amountInCents: transaction.amountInCents,
      currency: 'COP',
      customerEmail: transaction.customerEmail,
      cardToken: payload.cardToken,
      acceptanceToken: payload.acceptanceToken,
      acceptPersonalAuthToken: payload.acceptPersonalAuthToken,
      customerIp: payload.customerIp ?? '127.0.0.1',
      installments: payload.installments,
    });

    this.logger.log(
      `Wompi transaction ${wompiTransaction.id} created for local transaction ${transactionId} with status ${wompiTransaction.status}`,
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
      `Persisting payment result for transaction ${transactionId}: ${fulfilledTransaction.paymentStatus} / ${fulfilledTransaction.fulfillmentStatus}`,
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
