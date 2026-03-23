import { MODULE_METADATA } from '@nestjs/common/constants';
import { WOMPI_GATEWAY } from './application/ports/wompi-gateway.port';
import { PaymentsModule } from './payments.module';
import { WompiGateway } from './infrastructure/gateways/wompi.gateway';

describe('PaymentsModule', () => {
  it('exports the Wompi gateway token', () => {
    const exportsMetadata = Reflect.getMetadata(
      MODULE_METADATA.EXPORTS,
      PaymentsModule,
    );

    expect(exportsMetadata).toContain(WOMPI_GATEWAY);
  });

  it('binds WOMPI_GATEWAY to WompiGateway', () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      PaymentsModule,
    );
    const provider = providers.find(
      (entry: { provide?: symbol }) => entry.provide === WOMPI_GATEWAY,
    ) as { provide: symbol; useExisting: typeof WompiGateway };

    expect(provider.useExisting).toBe(WompiGateway);
  });
});
