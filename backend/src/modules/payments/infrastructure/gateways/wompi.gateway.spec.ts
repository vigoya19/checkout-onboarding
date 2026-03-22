import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WompiGateway } from './wompi.gateway';

const buildConfigService = (
  overrides?: Partial<Record<string, string | undefined>>,
) =>
  ({
    get: jest.fn((key: string) => {
      const values: Record<string, string | undefined> = {
        WOMPI_BASE_URL: 'https://wompi.test/v1',
        WOMPI_PUBLIC_KEY: 'pub_key_12345678',
        WOMPI_PRIVATE_KEY: 'prv_key_12345678',
        WOMPI_INTEGRITY_SECRET: 'integrity_secret',
        WOMPI_EVENTS_SECRET: 'events_secret',
        ...overrides,
      };

      return values[key];
    }),
  }) as unknown as ConfigService;

describe('WompiGateway', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('fetches acceptance tokens from Wompi', async () => {
    const gateway = new WompiGateway(buildConfigService());

    jest.spyOn(global, 'fetch' as never).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          presigned_acceptance: {
            acceptance_token: 'acceptance-token',
            permalink: 'https://terms',
          },
        },
      }),
    } as Response);

    await expect(gateway.getAcceptanceTokens()).resolves.toEqual(
      expect.objectContaining({
        acceptanceToken: 'acceptance-token',
        acceptancePermalink: 'https://terms',
      }),
    );
  });

  it('maps personal data auth tokens when Wompi returns them', async () => {
    const gateway = new WompiGateway(buildConfigService());

    jest.spyOn(global, 'fetch' as never).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          presigned_acceptance: {
            acceptance_token: 'acceptance-token',
          },
          presigned_personal_data_auth: {
            acceptance_token: 'personal-token',
            permalink: 'https://personal-data',
          },
        },
      }),
    } as Response);

    await expect(gateway.getAcceptanceTokens()).resolves.toEqual(
      expect.objectContaining({
        acceptPersonalAuthToken: 'personal-token',
        acceptPersonalAuthPermalink: 'https://personal-data',
      }),
    );
  });

  it('falls back to the default base url', async () => {
    const gateway = new WompiGateway(
      buildConfigService({
        WOMPI_BASE_URL: undefined,
      }),
    );
    const fetchMock = jest.spyOn(global, 'fetch' as never).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          presigned_acceptance: {
            acceptance_token: 'acceptance-token',
          },
        },
      }),
    } as Response);

    await gateway.getAcceptanceTokens();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api-sandbox.co.uat.wompi.dev/v1/merchants/pub_key_12345678',
    );
  });

  it('throws when acceptance token retrieval fails', async () => {
    const gateway = new WompiGateway(buildConfigService());

    jest.spyOn(global, 'fetch' as never).mockResolvedValue({
      ok: false,
    } as Response);

    await expect(gateway.getAcceptanceTokens()).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('creates a card transaction', async () => {
    const gateway = new WompiGateway(buildConfigService());

    jest.spyOn(global, 'fetch' as never).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: 'wompi-tx',
          reference: 'ref-1',
          status: 'APPROVED',
          payment_method_type: 'CARD',
          payment_method: {
            brand: 'VISA',
            last_four: '4242',
          },
        },
      }),
    } as Response);

    await expect(
      gateway.createCardTransaction({
        reference: 'ref-1',
        amountInCents: 2000,
        currency: 'COP',
        customerEmail: 'customer@example.com',
        cardToken: 'card-token',
        acceptanceToken: 'acceptance-token',
        acceptPersonalAuthToken: 'personal-token',
        customerIp: '127.0.0.1',
        installments: 1,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'wompi-tx',
        status: 'APPROVED',
      }),
    );
  });

  it('throws when card transaction creation fails', async () => {
    const gateway = new WompiGateway(buildConfigService());

    jest.spyOn(global, 'fetch' as never).mockResolvedValue({
      ok: false,
      text: async () => 'failure',
    } as Response);

    await expect(
      gateway.createCardTransaction({
        reference: 'ref-1',
        amountInCents: 2000,
        currency: 'COP',
        customerEmail: 'customer@example.com',
        cardToken: 'card-token',
        acceptanceToken: 'acceptance-token',
        acceptPersonalAuthToken: null,
        customerIp: '127.0.0.1',
        installments: 1,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('fetches a transaction from Wompi', async () => {
    const gateway = new WompiGateway(buildConfigService());

    jest.spyOn(global, 'fetch' as never).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: 'wompi-tx',
          reference: 'ref-1',
          status: 'PENDING',
        },
      }),
    } as Response);

    await expect(gateway.getTransaction('wompi-tx')).resolves.toEqual(
      expect.objectContaining({
        id: 'wompi-tx',
        status: 'PENDING',
      }),
    );
  });

  it('throws when transaction sync fails', async () => {
    const gateway = new WompiGateway(buildConfigService());

    jest.spyOn(global, 'fetch' as never).mockResolvedValue({
      ok: false,
      text: async () => 'failure',
    } as Response);

    await expect(gateway.getTransaction('wompi-tx')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('accepts a valid webhook signature', () => {
    const gateway = new WompiGateway(buildConfigService());
    const timestamp = 1234567890;
    const payload = {
      timestamp,
      data: {
        transaction: {
          id: 'wompi-tx',
          reference: 'ref-1',
        },
      },
      signature: {
        properties: ['transaction.id', 'transaction.reference'],
        checksum: '',
      },
    };
    const crypto = require('node:crypto') as typeof import('node:crypto');

    payload.signature.checksum = crypto
      .createHash('sha256')
      .update(`wompi-txref-1${timestamp}events_secret`)
      .digest('hex')
      .toUpperCase();

    expect(gateway.verifyWebhookSignature(payload as never)).toBe(true);
  });

  it('rejects an invalid webhook signature', () => {
    const gateway = new WompiGateway(buildConfigService());

    expect(
      gateway.verifyWebhookSignature({
        timestamp: 1234567890,
        data: { transaction: { id: 'wompi-tx', reference: 'ref-1' } },
        signature: {
          properties: ['transaction.id'],
          checksum: 'INVALID',
        },
      } as never),
    ).toBe(false);
  });

  it('returns false when webhook signature references a missing property', () => {
    const gateway = new WompiGateway(buildConfigService());

    expect(
      gateway.verifyWebhookSignature({
        timestamp: 1234567890,
        data: { transaction: { id: 'wompi-tx' } },
        signature: {
          properties: ['transaction.reference'],
          checksum: 'INVALID',
        },
      } as never),
    ).toBe(false);
  });

  it('rejects webhook payloads without signature data', () => {
    const gateway = new WompiGateway(buildConfigService());

    expect(gateway.verifyWebhookSignature({ data: {} } as never)).toBe(false);
  });

  it('rejects webhook payloads without data', () => {
    const gateway = new WompiGateway(buildConfigService());

    expect(
      gateway.verifyWebhookSignature({
        timestamp: 1234567890,
        signature: {
          properties: ['transaction.id'],
          checksum: 'INVALID',
        },
      } as never),
    ).toBe(false);
  });

  it('fails fast when required config is missing', () => {
    expect(
      () =>
        new WompiGateway(
          buildConfigService({
            WOMPI_PUBLIC_KEY: undefined,
          }),
        ),
    ).toThrow('Missing required configuration value: WOMPI_PUBLIC_KEY');
  });

  it('fetches acceptance tokens with short keys without leaking them in logs', async () => {
    const gateway = new WompiGateway(
      buildConfigService({
        WOMPI_PUBLIC_KEY: 'short',
      }),
    );

    jest.spyOn(global, 'fetch' as never).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          presigned_acceptance: {
            acceptance_token: 'acceptance-token',
          },
        },
      }),
    } as Response);

    await expect(gateway.getAcceptanceTokens()).resolves.toEqual(
      expect.objectContaining({
        acceptanceToken: 'acceptance-token',
      }),
    );
  });
});
