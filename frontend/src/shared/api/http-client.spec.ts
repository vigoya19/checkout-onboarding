import { httpGet, httpPost } from '@/shared/api/http-client'

describe('http-client', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: jest.fn(),
      writable: true,
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: originalFetch,
      writable: true,
    })
  })

  it('returns parsed json for successful GET requests', async () => {
    ;(globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
    } as unknown as Response)

    await expect(httpGet('/health')).resolves.toEqual({ ok: true })
  })

  it('returns nested API validation messages in a friendly way', async () => {
    ;(globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      text: jest
        .fn()
        .mockResolvedValue(JSON.stringify({ message: ['Campo invalido'] })),
    } as unknown as Response)

    await expect(httpPost('/assistant', { message: 'hola' })).rejects.toThrow(
      'Campo invalido',
    )
  })

  it('falls back to the raw error text when the body is not JSON', async () => {
    ;(globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
      text: jest.fn().mockResolvedValue('Servicio no disponible'),
    } as unknown as Response)

    await expect(httpGet('/products')).rejects.toThrow('Servicio no disponible')
  })
})
