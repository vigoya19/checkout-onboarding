import { MODULE_METADATA } from '@nestjs/common/constants';
import { CatalogModule } from '../catalog/catalog.module';
import { ASSISTANT_CLIENT } from './application/ports/assistant-client.port';
import { AssistantModule } from './assistant.module';
import { OpenAiAssistantGateway } from './infrastructure/gateways/openai-assistant.gateway';

describe('AssistantModule', () => {
  it('binds ASSISTANT_CLIENT to OpenAiAssistantGateway', () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      AssistantModule,
    );
    const provider = providers.find(
      (entry: { provide?: symbol }) => entry.provide === ASSISTANT_CLIENT,
    ) as { provide: symbol; useExisting: typeof OpenAiAssistantGateway };

    expect(provider.useExisting).toBe(OpenAiAssistantGateway);
  });

  it('imports CatalogModule to enrich the assistant context from the database', () => {
    const imports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      AssistantModule,
    );

    expect(imports).toContain(CatalogModule);
  });
});
