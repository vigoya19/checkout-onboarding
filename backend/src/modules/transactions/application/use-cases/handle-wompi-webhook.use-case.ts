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
import {
  WompiWebhookDto,
  type WompiWebhookTransactionDto,
} from '../../dto/wompi-webhook.dto';
import type { PaymentStatus } from '../../domain/transaction.entity';

@Injectable()
export class HandleWompiWebhookUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(WOMPI_GATEWAY)
    private readonly wompiGateway: WompiGatewayPort,
  ) {}

  async execute(payload: WompiWebhookDto) {
    if (payload.event !== 'transaction.updated') {
      return { received: true, ignored: true };
    }

    if (!this.wompiGateway.verifyWebhookSignature(payload)) {
      throw new BadRequestException('Invalid Wompi webhook signature');
    }

    const wompiTransaction: WompiWebhookTransactionDto =
      this.getTransactionPayload(payload);
    const transactionReference: string = wompiTransaction.reference;

    const transaction =
      await this.transactionRepository.findById(transactionReference);

    if (!transaction) {
      throw new NotFoundException(
        `Transaction ${transactionReference} was not found`,
      );
    }

    const updatedTransaction = transaction.syncPayment({
      paymentStatus: this.toPaymentStatus(wompiTransaction.status),
      wompiTransactionId: wompiTransaction.id,
      paymentMethodType: wompiTransaction.payment_method_type ?? null,
      paymentStatusMessage: `Webhook update received at ${
        payload.timestamp ?? 'unknown'
      }`,
      cardBrand: transaction.cardBrand,
      cardLastFour: transaction.cardLastFour,
    });

    await this.transactionRepository.save(updatedTransaction);

    return { received: true };
  }

  private getTransactionPayload(
    payload: WompiWebhookDto,
  ): WompiWebhookTransactionDto {
    if (!payload.data.transaction) {
      throw new BadRequestException('Missing transaction payload');
    }

    return payload.data.transaction;
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
