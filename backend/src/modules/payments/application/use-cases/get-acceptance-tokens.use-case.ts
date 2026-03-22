import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  WOMPI_GATEWAY,
  type WompiGatewayPort,
} from '../ports/wompi-gateway.port';

@Injectable()
export class GetAcceptanceTokensUseCase {
  private readonly logger = new Logger(GetAcceptanceTokensUseCase.name);

  constructor(
    @Inject(WOMPI_GATEWAY)
    private readonly wompiGateway: WompiGatewayPort,
  ) {}

  execute() {
    this.logger.log('Requesting Wompi acceptance tokens');

    return this.wompiGateway.getAcceptanceTokens();
  }
}
