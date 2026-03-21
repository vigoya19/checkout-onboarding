import {
  BadRequestException,
  Inject,
  Injectable,
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

@Injectable()
export class ProcessTransactionPaymentUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(WOMPI_GATEWAY)
    private readonly wompiGateway: WompiGatewayPort,
  ) {}

  async execute(transactionId: string, payload: ProcessTransactionPaymentDto) {
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
      customerIp: payload.customerIp,
      installments: payload.installments,
    });

    const updatedTransaction = transaction.syncPayment({
      paymentStatus: this.toPaymentStatus(wompiTransaction.status),
      wompiTransactionId: wompiTransaction.id,
      paymentMethodType: wompiTransaction.paymentMethodType,
      paymentStatusMessage: wompiTransaction.statusMessage,
      cardBrand: wompiTransaction.cardBrand,
      cardLastFour: wompiTransaction.cardLastFour,
    });

    return this.transactionRepository.save(updatedTransaction);
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
