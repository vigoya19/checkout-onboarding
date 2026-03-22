import { createHash } from 'node:crypto';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  CreateWompiCardTransactionInput,
  WompiAcceptanceTokens,
  WompiGatewayPort,
  WompiTransactionSnapshot,
  WompiWebhookPayload,
} from '../../application/ports/wompi-gateway.port';

type WompiMerchantResponse = {
  data: {
    presigned_acceptance: {
      acceptance_token: string;
      permalink?: string;
    };
    presigned_personal_data_auth?: {
      acceptance_token: string;
      permalink?: string;
    };
  };
};

type WompiTransactionResponse = {
  data: {
    id: string;
    reference: string;
    status: string;
    status_message?: string;
    payment_method_type?: string | null;
    payment_method?: {
      brand?: string | null;
      last_four?: string | null;
    };
  };
};

@Injectable()
export class WompiGateway implements WompiGatewayPort {
  private readonly logger = new Logger(WompiGateway.name);
  private readonly wompiBaseUrl: string;
  private readonly wompiPublicKey: string;
  private readonly wompiPrivateKey: string;
  private readonly wompiIntegritySecret: string;
  private readonly wompiEventsSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.wompiBaseUrl =
      this.configService.get<string>('WOMPI_BASE_URL') ??
      'https://api-sandbox.co.uat.wompi.dev/v1';
    this.wompiPublicKey = this.requireConfig('WOMPI_PUBLIC_KEY');
    this.wompiPrivateKey = this.requireConfig('WOMPI_PRIVATE_KEY');
    this.wompiIntegritySecret = this.requireConfig('WOMPI_INTEGRITY_SECRET');
    this.wompiEventsSecret = this.requireConfig('WOMPI_EVENTS_SECRET');
  }

  async getAcceptanceTokens(): Promise<WompiAcceptanceTokens> {
    this.logger.log(
      `Fetching acceptance tokens from ${this.wompiBaseUrl} for public key ${this.maskValue(this.wompiPublicKey)}`,
    );

    const response = await fetch(
      `${this.wompiBaseUrl}/merchants/${this.wompiPublicKey}`,
    );

    if (!response.ok) {
      throw new UnauthorizedException(
        'Unable to fetch Wompi acceptance tokens',
      );
    }

    const body = (await response.json()) as WompiMerchantResponse;

    this.logger.log('Acceptance tokens fetched successfully from Wompi');

    return {
      acceptanceToken: body.data.presigned_acceptance.acceptance_token,
      acceptancePermalink: body.data.presigned_acceptance.permalink ?? null,
      acceptPersonalAuthToken:
        body.data.presigned_personal_data_auth?.acceptance_token ?? null,
      acceptPersonalAuthPermalink:
        body.data.presigned_personal_data_auth?.permalink ?? null,
    };
  }

  async createCardTransaction(
    input: CreateWompiCardTransactionInput,
  ): Promise<WompiTransactionSnapshot> {
    this.logger.log(
      `Creating Wompi transaction for reference ${input.reference} amount ${input.amountInCents} and email ${input.customerEmail}`,
    );

    const payload = {
      amount_in_cents: input.amountInCents,
      currency: input.currency,
      customer_email: input.customerEmail,
      payment_method: {
        type: 'CARD',
        token: input.cardToken,
        installments: input.installments,
      },
      payment_method_type: 'CARD',
      reference: input.reference,
      acceptance_token: input.acceptanceToken,
      accept_personal_auth: input.acceptPersonalAuthToken,
      ip: input.customerIp,
      signature: this.generateIntegritySignature(
        input.reference,
        input.amountInCents,
        input.currency,
      ),
    };

    const response = await fetch(`${this.wompiBaseUrl}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.wompiPrivateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new UnauthorizedException(
        `Wompi transaction creation failed: ${errorBody}`,
      );
    }

    const body = (await response.json()) as WompiTransactionResponse;

    this.logger.log(
      `Wompi transaction created: ${body.data.id} with status ${body.data.status}`,
    );

    return this.toSnapshot(body.data);
  }

  async getTransaction(
    transactionId: string,
  ): Promise<WompiTransactionSnapshot> {
    this.logger.log(`Fetching Wompi transaction ${transactionId}`);

    const response = await fetch(
      `${this.wompiBaseUrl}/transactions/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${this.wompiPublicKey}`,
        },
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new UnauthorizedException(
        `Wompi transaction fetch failed: ${errorBody}`,
      );
    }

    const body = (await response.json()) as WompiTransactionResponse;

    this.logger.log(
      `Fetched Wompi transaction ${body.data.id} with status ${body.data.status}`,
    );

    return this.toSnapshot(body.data);
  }

  verifyWebhookSignature(payload: WompiWebhookPayload) {
    if (!payload.signature || !payload.timestamp) {
      this.logger.warn('Wompi webhook signature or timestamp missing');
      return false;
    }

    const data = payload.data ?? {};
    const expectedChecksum = createHash('sha256')
      .update(
        `${this.resolvePropertyValues(
          payload.signature.properties,
          data,
        )}${payload.timestamp}${this.wompiEventsSecret}`,
      )
      .digest('hex')
      .toUpperCase();

    const isValid =
      expectedChecksum === payload.signature.checksum.toUpperCase();

    this.logger.log(
      `Wompi webhook signature validation result: ${isValid ? 'valid' : 'invalid'}`,
    );

    return isValid;
  }

  private generateIntegritySignature(
    reference: string,
    amountInCents: number,
    currency: 'COP',
  ) {
    return createHash('sha256')
      .update(
        `${reference}${amountInCents}${currency}${this.wompiIntegritySecret}`,
      )
      .digest('hex');
  }

  private resolvePropertyValues(
    properties: string[],
    data: Record<string, unknown>,
  ) {
    return properties
      .map((property) =>
        property.split('.').reduce<unknown>((value, segment) => {
          if (
            value &&
            typeof value === 'object' &&
            segment in (value as Record<string, unknown>)
          ) {
            return (value as Record<string, unknown>)[segment];
          }

          return '';
        }, data),
      )
      .join('');
  }

  private toSnapshot(
    transaction: WompiTransactionResponse['data'],
  ): WompiTransactionSnapshot {
    return {
      id: transaction.id,
      reference: transaction.reference,
      status: transaction.status,
      statusMessage:
        transaction.status_message ?? 'Transaction status updated by Wompi',
      paymentMethodType: transaction.payment_method_type ?? null,
      cardBrand: transaction.payment_method?.brand ?? null,
      cardLastFour: transaction.payment_method?.last_four ?? null,
    };
  }

  private requireConfig(key: string) {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new Error(`Missing required configuration value: ${key}`);
    }

    return value;
  }

  private maskValue(value: string) {
    if (value.length <= 8) {
      return '***';
    }

    return `${value.slice(0, 4)}***${value.slice(-4)}`;
  }
}
