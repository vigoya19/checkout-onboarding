import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { GetTransactionUseCase } from './application/use-cases/get-transaction.use-case';
import { HandleWompiWebhookUseCase } from './application/use-cases/handle-wompi-webhook.use-case';
import { ProcessTransactionPaymentUseCase } from './application/use-cases/process-transaction-payment.use-case';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ProcessTransactionPaymentDto } from './dto/process-transaction-payment.dto';
import { WompiWebhookDto } from './dto/wompi-webhook.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionUseCase: GetTransactionUseCase,
    private readonly processTransactionPaymentUseCase: ProcessTransactionPaymentUseCase,
  ) {}

  @Post()
  createTransaction(@Body() payload: CreateTransactionDto) {
    return this.createTransactionUseCase.execute(payload);
  }

  @Get(':transactionId')
  getTransaction(@Param('transactionId') transactionId: string) {
    return this.getTransactionUseCase.execute(transactionId);
  }

  @Post(':transactionId/pay')
  payTransaction(
    @Param('transactionId') transactionId: string,
    @Body() payload: ProcessTransactionPaymentDto,
  ) {
    return this.processTransactionPaymentUseCase.execute(
      transactionId,
      payload,
    );
  }
}

@Controller('webhooks/wompi')
export class WompiWebhookController {
  constructor(
    private readonly handleWompiWebhookUseCase: HandleWompiWebhookUseCase,
  ) {}

  @Post()
  handleWebhook(@Body() payload: WompiWebhookDto) {
    return this.handleWompiWebhookUseCase.execute(payload);
  }
}
