import { Module } from '@nestjs/common';
import {
  WOMPI_GATEWAY,
  type WompiGatewayPort,
} from './application/ports/wompi-gateway.port';
import { GetCheckoutConfigUseCase } from './application/use-cases/get-checkout-config.use-case';
import { GetAcceptanceTokensUseCase } from './application/use-cases/get-acceptance-tokens.use-case';
import { WompiGateway } from './infrastructure/gateways/wompi.gateway';
import { PaymentsController } from './payments.controller';

@Module({
  controllers: [PaymentsController],
  providers: [
    GetCheckoutConfigUseCase,
    GetAcceptanceTokensUseCase,
    WompiGateway,
    {
      provide: WOMPI_GATEWAY,
      useExisting: WompiGateway,
    } satisfies {
      provide: symbol;
      useExisting: new (...args: never[]) => WompiGatewayPort;
    },
  ],
  exports: [WOMPI_GATEWAY],
})
export class PaymentsModule {}
