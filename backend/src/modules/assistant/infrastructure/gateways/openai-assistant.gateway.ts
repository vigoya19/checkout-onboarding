import {
  GatewayTimeoutException,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type {
  AssistantClientPort,
  AssistantRequest,
} from '../../application/ports/assistant-client.port';

const DEFAULT_OPENAI_MODEL = 'gpt-5-mini';
const DEFAULT_OPENAI_TIMEOUT_MS = 20_000;
const DEFAULT_OPENAI_MAX_OUTPUT_TOKENS = 180;

@Injectable()
export class OpenAiAssistantGateway implements AssistantClientPort {
  private readonly logger = new Logger(OpenAiAssistantGateway.name);
  private readonly client: OpenAI | null;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')?.trim();
    const configuredTimeoutMs = Number(
      this.configService.get<string>('OPENAI_TIMEOUT_MS') ??
        DEFAULT_OPENAI_TIMEOUT_MS,
    );

    this.model =
      this.configService.get<string>('OPENAI_MODEL')?.trim() ??
      DEFAULT_OPENAI_MODEL;
    this.timeoutMs =
      Number.isFinite(configuredTimeoutMs) && configuredTimeoutMs > 0
        ? configuredTimeoutMs
        : DEFAULT_OPENAI_TIMEOUT_MS;
    this.client = apiKey
      ? new OpenAI({
          apiKey,
          maxRetries: 0,
          timeout: this.timeoutMs,
        })
      : null;
  }

  async answer(input: AssistantRequest): Promise<string> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'El asistente no esta configurado en el backend.',
      );
    }

    const prompt = this.buildPrompt(input);

    try {
      const response = await this.client.responses.create({
        model: this.model,
        reasoning: {
          effort: 'minimal',
        },
        text: {
          verbosity: 'low',
        },
        instructions:
          'Eres un asistente de compra para una app de checkout onboarding. Responde en espanol claro, breve y util. Ayuda solo con dudas de producto, costo total, pasos del pago, entrega y estado del flujo. No inventes precios ni disponibilidad. Si falta informacion, dilo con claridad. Siempre entrega una respuesta final para el usuario.',
        input: prompt,
        max_output_tokens: DEFAULT_OPENAI_MAX_OUTPUT_TOKENS,
      });

      const answer = this.extractAnswer(response);

      if (!answer) {
        this.logger.warn(
          `OpenAI respondio sin texto util para el modelo ${this.model}.`,
        );
        return 'No pude generar una respuesta util en este momento.';
      }

      return answer;
    } catch (error) {
      this.logger.error(
        `Fallo consultando OpenAI: ${this.getErrorMessage(error)}`,
      );

      if (this.isTimeoutError(error)) {
        throw new GatewayTimeoutException(
          'El asistente tardo demasiado en responder. Intenta de nuevo.',
        );
      }

      throw new InternalServerErrorException(
        'No fue posible consultar el asistente en este momento.',
      );
    }
  }

  private buildPrompt(input: AssistantRequest) {
    const features =
      input.features && input.features.length > 0
        ? input.features.map((feature) => `- ${feature}`).join('\n')
        : 'No informadas';

    return [
      'Contexto de la compra:',
      `- Producto: ${input.productName ?? 'No seleccionado'}`,
      `- Descripcion: ${input.productDescription ?? 'No disponible'}`,
      `- Caracteristicas:\n${features}`,
      `- Stock disponible: ${typeof input.stock === 'number' ? input.stock : 'No disponible'}`,
      `- Paso actual: ${input.currentStep ?? 1} de 4`,
      `- Precio del producto: ${this.formatCurrency(input.priceInCents, input.currency)}`,
      `- Fee base: ${this.formatCurrency(input.baseFeeInCents, input.currency)}`,
      `- Delivery fee: ${this.formatCurrency(input.deliveryFeeInCents, input.currency)}`,
      `- Total estimado: ${this.formatCurrency(this.getEstimatedTotal(input), input.currency)}`,
      '',
      `Pregunta del usuario: ${input.message}`,
      '',
      'Da una respuesta corta, concreta y orientada a ayudar al usuario a continuar con la compra.',
    ].join('\n');
  }

  private extractAnswer(response: {
    output_text?: string;
    output?: unknown;
  }): string | null {
    if (typeof response.output_text === 'string') {
      const normalizedOutputText = this.normalizeText(response.output_text);

      if (normalizedOutputText) {
        return normalizedOutputText;
      }
    }

    const fragments = this.extractFragments(response.output);

    if (fragments.length === 0) {
      return null;
    }

    return this.normalizeText(fragments.join(' '));
  }

  private extractFragments(output: unknown): string[] {
    if (!Array.isArray(output)) {
      return [];
    }

    return output.flatMap((item) => this.extractFragmentsFromItem(item));
  }

  private extractFragmentsFromItem(item: unknown): string[] {
    if (!this.isRecord(item)) {
      return [];
    }

    const directText = this.extractTextValue(item.text);
    const contentFragments = Array.isArray(item.content)
      ? item.content.flatMap((contentItem) =>
          this.extractFragmentsFromContentItem(contentItem),
        )
      : [];

    return [...directText, ...contentFragments];
  }

  private extractFragmentsFromContentItem(contentItem: unknown): string[] {
    if (!this.isRecord(contentItem)) {
      return [];
    }

    return this.extractTextValue(contentItem.text);
  }

  private extractTextValue(value: unknown): string[] {
    if (typeof value === 'string') {
      return [value];
    }

    if (this.isRecord(value) && typeof value.value === 'string') {
      return [value.value];
    }

    return [];
  }

  private normalizeText(value: string): string | null {
    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized.length > 0 ? normalized : null;
  }

  private getEstimatedTotal(input: AssistantRequest): number | undefined {
    if (
      typeof input.priceInCents !== 'number' ||
      typeof input.baseFeeInCents !== 'number' ||
      typeof input.deliveryFeeInCents !== 'number'
    ) {
      return undefined;
    }

    return input.priceInCents + input.baseFeeInCents + input.deliveryFeeInCents;
  }

  private formatCurrency(amountInCents?: number, currency?: 'COP') {
    if (typeof amountInCents !== 'number') {
      return 'No disponible';
    }

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency ?? 'COP',
      maximumFractionDigits: 0,
    }).format(amountInCents / 100);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    return 'Error desconocido';
  }

  private isTimeoutError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    return /timeout|timed out|abort/i.test(
      `${error.name} ${error.message}`.trim(),
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
