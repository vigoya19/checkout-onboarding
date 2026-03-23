jest.mock('@/shared/api/http-client', () => ({
  httpGet: jest.fn(),
}))

jest.mock('@/shared/config/env', () => ({
  appEnv: {
    wompiBaseUrl: 'https://wompi.test/v1',
    wompiPublicKey: 'pub_test',
  },
}))

import { httpGet } from '@/shared/api/http-client'
import { getAcceptanceTokens, tokenizeCard } from '@/features/payments/payments.api'

describe('payments.api', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('loads acceptance tokens from the backend', async () => {
    ;(httpGet as jest.Mock).mockResolvedValue({ acceptanceToken: 'acc' })

    await expect(getAcceptanceTokens()).resolves.toEqual({
      acceptanceToken: 'acc',
    })
    expect(httpGet).toHaveBeenCalledWith('/payments/acceptance-tokens')
  })

  it('tokenizes cards with Wompi', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'CREATED',
        data: { id: 'tok_1', brand: 'VISA', last_four: '4242' },
      }),
    })

    await expect(
      tokenizeCard({
        number: '4242 4242 4242 4242',
        expMonth: '08',
        expYear: '29',
        cvc: '123',
        cardHolder: 'Andres',
      }),
    ).resolves.toEqual({
      tokenId: 'tok_1',
      brand: 'VISA',
      lastFour: '4242',
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'https://wompi.test/v1/tokens/cards',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer pub_test',
        }),
      }),
    )
  })

  it('throws when Wompi does not create the token', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'ERROR',
        data: { id: 'tok_1' },
      }),
    })

    await expect(
      tokenizeCard({
        number: '4242 4242 4242 4242',
        expMonth: '08',
        expYear: '29',
        cvc: '123',
        cardHolder: 'Andres',
      }),
    ).rejects.toThrow('Wompi no pudo tokenizar la tarjeta en sandbox')
  })

  it('throws the response text when tokenization fails at HTTP level', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      text: async () => 'tarjeta invalida',
    })

    await expect(
      tokenizeCard({
        number: '4242 4242 4242 4242',
        expMonth: '08',
        expYear: '29',
        cvc: '123',
        cardHolder: 'Andres',
      }),
    ).rejects.toThrow('tarjeta invalida')
  })
})
