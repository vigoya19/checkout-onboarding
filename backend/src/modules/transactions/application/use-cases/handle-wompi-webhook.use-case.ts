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
import {
  WompiWebhookDto,
  type WompiWebhookTransactionDto,
} from '../../dto/wompi-webhook.dto';
import type { PaymentStatus } from '../../domain/transaction.entity';
import { FulfillApprovedTransactionUseCase } from './fulfill-approved-transaction.use-case';

@Injectable()
export class HandleWompiWebhookUseCase {
  private readonly logger = new Logger(HandleWompiWebhookUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(WOMPI_GATEWAY)
    private readonly wompiGateway: WompiGatewayPort,
    private readonly fulfillApprovedTransactionUseCase: FulfillApprovedTransactionUseCase,
  ) {}

  async execute(payload: WompiWebhookDto) {
    this.logger.log(`Received Wompi webhook event ${payload.event}`);

    if (payload.event !== 'transaction.updated') {
      this.logger.warn(`Ignoring unsupported Wompi event ${payload.event}`);
      return { received: true, ignored: true };
    }

    if (!this.wompiGateway.verifyWebhookSignature(payload)) {
      this.logger.error('Rejected Wompi webhook due to invalid signature');
      throw new BadRequestException('Invalid Wompi webhook signature');
    }

    const wompiTransaction: WompiWebhookTransactionDto =
      this.getTransactionPayload(payload);
    const transactionReference: string = wompiTransaction.reference;

    this.logger.log(
      `Applying Wompi webhook for local transaction ${transactionReference} and Wompi transaction ${wompiTransaction.id}`,
    );

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

    const fulfilledTransaction =
      await this.fulfillApprovedTransactionUseCase.execute(updatedTransaction);

    await this.transactionRepository.save(fulfilledTransaction);

    this.logger.log(
      `Webhook persisted for transaction ${transactionReference} with status ${fulfilledTransaction.paymentStatus} / ${fulfilledTransaction.fulfillmentStatus}`,
    );

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
