import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
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
    @Req() request: Request,
  ) {
    return this.processTransactionPaymentUseCase.execute(transactionId, {
      ...payload,
      customerIp: payload.customerIp ?? this.resolveCustomerIp(request),
    });
  }

  private resolveCustomerIp(request: Request) {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
      return forwardedFor.split(',')[0].trim();
    }

    if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
      return forwardedFor[0];
    }

    return request.ip ?? '127.0.0.1';
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
