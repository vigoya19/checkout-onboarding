jest.mock('@/shared/config/env', () => ({
  appEnv: {
    apiBaseUrl: 'https://api.test',
  },
}))

import { httpGet, httpPost } from '@/shared/api/http-client'

describe('http-client', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('performs successful GET requests', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    })

    await expect(httpGet('/health')).resolves.toEqual({ ok: true })
    expect(global.fetch).toHaveBeenCalledWith('https://api.test/health')
  })

  it('throws on failed GET requests', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
    })

    await expect(httpGet('/health')).rejects.toThrow(
      'Request failed with status 503',
    )
  })

  it('performs successful POST requests', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ created: true }),
    })

    await expect(httpPost('/transactions', { a: 1 })).resolves.toEqual({
      created: true,
    })
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test/transactions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ a: 1 }),
      }),
    )
  })

  it('throws the backend text on failed POST requests', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'payload invalido',
    })

    await expect(httpPost('/transactions', { a: 1 })).rejects.toThrow(
      'payload invalido',
    )
  })
})
