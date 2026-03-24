import {
  GatewayTimeoutException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import OpenAI from 'openai';
import { OpenAiAssistantGateway } from './openai-assistant.gateway';

jest.mock('openai');

describe('OpenAiAssistantGateway', () => {
  const create = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      responses: { create },
    }));
  });

  it('throws when no api key is configured', async () => {
    const gateway = new OpenAiAssistantGateway({
      get: jest.fn().mockReturnValue(undefined),
    } as never);

    await expect(gateway.answer({ message: 'hola' })).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('returns output text from OpenAI', async () => {
    create.mockResolvedValue({ output_text: 'Respuesta corta' });
    const gateway = new OpenAiAssistantGateway({
      get: jest
        .fn()
        .mockImplementation((key: string) =>
          key === 'OPENAI_API_KEY' ? 'sk-test' : 'gpt-5-mini',
        ),
    } as never);

    await expect(
      gateway.answer({
        message: '¿Que incluye el pago?',
        productName: 'PlayStation 5',
        productDescription: 'desc',
        features: ['1 TB SSD'],
        priceInCents: 299_900_000,
        baseFeeInCents: 390_000,
        deliveryFeeInCents: 990_000,
        currentStep: 1,
        currency: 'COP',
      }),
    ).resolves.toBe('Respuesta corta');
  });

  it('extracts text from structured output when output_text is empty', async () => {
    create.mockResolvedValue({
      output: [
        {
          content: [
            {
              text: {
                value: 'Respuesta desde content.value',
              },
            },
          ],
        },
      ],
    });
    const gateway = new OpenAiAssistantGateway({
      get: jest
        .fn()
        .mockImplementation((key: string) =>
          key === 'OPENAI_API_KEY' ? 'sk-test' : 'gpt-5-mini',
        ),
    } as never);

    await expect(gateway.answer({ message: 'hola' })).resolves.toBe(
      'Respuesta desde content.value',
    );
  });

  it('throws a controlled exception when OpenAI fails', async () => {
    create.mockRejectedValue(new Error('boom'));
    const gateway = new OpenAiAssistantGateway({
      get: jest
        .fn()
        .mockImplementation((key: string) =>
          key === 'OPENAI_API_KEY' ? 'sk-test' : 'gpt-5-mini',
        ),
    } as never);

    await expect(gateway.answer({ message: 'hola' })).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('throws a timeout exception when OpenAI takes too long', async () => {
    create.mockRejectedValue(new Error('Request timed out'));
    const gateway = new OpenAiAssistantGateway({
      get: jest
        .fn()
        .mockImplementation((key: string) =>
          key === 'OPENAI_API_KEY' ? 'sk-test' : 'gpt-5-mini',
        ),
    } as never);

    await expect(gateway.answer({ message: 'hola' })).rejects.toBeInstanceOf(
      GatewayTimeoutException,
    );
  });
});
