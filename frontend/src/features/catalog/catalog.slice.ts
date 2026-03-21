import { createSlice } from '@reduxjs/toolkit'
import type { Product } from '@/shared/types/product'

type CatalogState = {
  featuredProduct: Product
}

const initialState: CatalogState = {
  featuredProduct: {
    id: 'prod_coffee_press',
    name: 'Aura Coffee Press',
    description:
      'Producto semilla para la prueba. Más adelante este dato saldrá del backend y DynamoDB.',
    priceInCents: 189900,
    currency: 'COP',
    stock: 12,
  },
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
})

export const catalogReducer = catalogSlice.reducer
