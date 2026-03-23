jest.mock('@/features/catalog/catalog.api', () => ({
  listProducts: jest.fn(),
}))

import { catalogReducer, fetchProducts, selectProduct } from '@/features/catalog/catalog.slice'

describe('catalog.slice', () => {
  it('selects a product manually', () => {
    const state = catalogReducer(undefined, selectProduct('prod_ps4'))

    expect(state.selectedProductId).toBe('prod_ps4')
  })

  it('marks loading while products are being fetched', () => {
    const state = catalogReducer(undefined, fetchProducts.pending('id'))

    expect(state.status).toBe('loading')
    expect(state.errorMessage).toBeNull()
  })

  it('stores products and defaults the selected product to the first one', () => {
    const state = catalogReducer(
      undefined,
      fetchProducts.fulfilled(
        [
          {
            id: 'prod_ps5',
            name: 'PS5',
            description: 'desc',
            priceInCents: 1,
            currency: 'COP',
            stock: 2,
          },
        ],
        'id',
      ),
    )

    expect(state.status).toBe('succeeded')
    expect(state.products).toHaveLength(1)
    expect(state.selectedProductId).toBe('prod_ps5')
  })

  it('stores the error when loading products fails', () => {
    const state = catalogReducer(
      undefined,
      fetchProducts.rejected(new Error('fallo api'), 'id'),
    )

    expect(state.status).toBe('failed')
    expect(state.errorMessage).toBe('fallo api')
  })
})
