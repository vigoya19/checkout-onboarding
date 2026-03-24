import { Body, Controller, Post } from '@nestjs/common';
import { AskAssistantUseCase } from './application/use-cases/ask-assistant.use-case';
import { AskAssistantDto } from './dto/ask-assistant.dto';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly askAssistantUseCase: AskAssistantUseCase) {}

  @Post()
  async ask(@Body() payload: AskAssistantDto) {
    const answer = await this.askAssistantUseCase.execute(payload);

    return { answer };
  }
}
