import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import {
  ASSISTANT_CLIENT,
  type AssistantClientPort,
} from './application/ports/assistant-client.port';
import { AskAssistantUseCase } from './application/use-cases/ask-assistant.use-case';
import { OpenAiAssistantGateway } from './infrastructure/gateways/openai-assistant.gateway';
import { AssistantController } from './assistant.controller';

@Module({
  imports: [CatalogModule],
  controllers: [AssistantController],
  providers: [
    AskAssistantUseCase,
    OpenAiAssistantGateway,
    {
      provide: ASSISTANT_CLIENT,
      useExisting: OpenAiAssistantGateway,
    } satisfies {
      provide: symbol;
      useExisting: new (...args: never[]) => AssistantClientPort;
    },
  ],
})
export class AssistantModule {}
