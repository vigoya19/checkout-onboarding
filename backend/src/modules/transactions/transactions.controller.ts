import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { GetTransactionUseCase } from './application/use-cases/get-transaction.use-case';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionUseCase: GetTransactionUseCase,
  ) {}

  @Post()
  createTransaction(@Body() payload: CreateTransactionDto) {
    return this.createTransactionUseCase.execute(payload);
  }

  @Get(':transactionId')
  getTransaction(@Param('transactionId') transactionId: string) {
    return this.getTransactionUseCase.execute(transactionId);
  }
}
