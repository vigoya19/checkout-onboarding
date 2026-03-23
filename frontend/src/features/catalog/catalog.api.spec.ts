jest.mock('@/shared/api/http-client', () => ({
  httpGet: jest.fn(),
}))

import { httpGet } from '@/shared/api/http-client'
import { listProducts } from '@/features/catalog/catalog.api'

describe('catalog.api', () => {
  it('maps ids and sorts featured products', async () => {
    ;(httpGet as jest.Mock).mockResolvedValue([
      {
        productId: 'prod_ps4',
        name: 'PS4',
        description: 'desc',
        priceInCents: 100,
        currency: 'COP',
        stock: 2,
      },
      {
        id: 'prod_ps5',
        name: 'PS5',
        description: 'desc',
        priceInCents: 200,
        currency: 'COP',
        stock: 3,
      },
    ])

    await expect(listProducts()).resolves.toEqual([
      expect.objectContaining({ id: 'prod_ps5' }),
      expect.objectContaining({ id: 'prod_ps4' }),
    ])
  })
})
