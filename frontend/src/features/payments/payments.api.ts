import { httpGet } from '@/shared/api/http-client'
import { appEnv } from '@/shared/config/env'

type AcceptanceTokensResponse = {
  acceptanceToken: string
  acceptancePermalink: string | null
  acceptPersonalAuthToken: string | null
  acceptPersonalAuthPermalink: string | null
}

type CheckoutConfigResponse = {
  baseFeeInCents: number
  deliveryFeeInCents: number
}

type WompiCardTokenResponse = {
  status: string
  data: {
    id: string
    brand?: string | null
    last_four?: string | null
  }
}

export type WompiAcceptanceTokens = AcceptanceTokensResponse
export type CheckoutConfig = CheckoutConfigResponse

export async function getAcceptanceTokens() {
  return httpGet<AcceptanceTokensResponse>('/payments/acceptance-tokens')
}

export async function getCheckoutConfig() {
  return httpGet<CheckoutConfigResponse>('/payments/checkout-config')
}

export async function tokenizeCard(input: {
  number: string
  expMonth: string
  expYear: string
  cvc: string
  cardHolder: string
}) {
  if (!appEnv.wompiPublicKey) {
    throw new Error('Falta configurar VITE_WOMPI_PUBLIC_KEY en el frontend.')
  }

  const response = await fetch(`${appEnv.wompiBaseUrl}/tokens/cards`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${appEnv.wompiPublicKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      number: input.number.replace(/\D/g, ''),
      exp_month: input.expMonth,
      exp_year: input.expYear,
      cvc: input.cvc,
      card_holder: input.cardHolder,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'No fue posible tokenizar la tarjeta con Wompi')
  }

  const body = (await response.json()) as WompiCardTokenResponse

  if (body.status !== 'CREATED') {
    throw new Error('Wompi no pudo tokenizar la tarjeta en sandbox')
  }

  return {
    tokenId: body.data.id,
    brand: body.data.brand ?? null,
    lastFour: body.data.last_four ?? null,
  }
}
