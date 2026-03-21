import { Inject, Injectable } from '@nestjs/common';
import {
  WOMPI_GATEWAY,
  type WompiGatewayPort,
} from '../ports/wompi-gateway.port';

@Injectable()
export class GetAcceptanceTokensUseCase {
  constructor(
    @Inject(WOMPI_GATEWAY)
    private readonly wompiGateway: WompiGatewayPort,
  ) {}

  execute() {
    return this.wompiGateway.getAcceptanceTokens();
  }
}
