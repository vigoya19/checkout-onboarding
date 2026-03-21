import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/app/providers/store'
import type { Product } from '@/shared/types/product'
import { listProducts } from '@/features/catalog/catalog.api'

type CatalogState = {
  products: Product[]
  selectedProductId: string
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  errorMessage: string | null
}

const fallbackProducts: Product[] = [
  {
    id: 'prod_ps5',
    name: 'PlayStation 5',
    description:
      'Consola PS5 de nueva generacion con almacenamiento de 1 TB y soporte para juego en 4K.',
    priceInCents: 299900000,
    currency: 'COP',
    stock: 6,
  },
  {
    id: 'prod_ps4',
    name: 'PlayStation 4',
    description:
      'Consola PS4 Slim de 1 TB ideal para catalogo legacy y juegos de generacion anterior.',
    priceInCents: 139989000,
    currency: 'COP',
    stock: 8,
  },
  {
    id: 'prod_xbox_series_x',
    name: 'Xbox Series X',
    description:
      'Consola Xbox Series X de 1 TB para juego en 4K con alto rendimiento.',
    priceInCents: 309990000,
    currency: 'COP',
    stock: 5,
  },
  {
    id: 'prod_xbox_series_s',
    name: 'Xbox Series S',
    description:
      'Consola Xbox Series S compacta con 512 GB y excelente relacion costo-rendimiento.',
    priceInCents: 194990000,
    currency: 'COP',
    stock: 9,
  },
  {
    id: 'prod_nintendo_switch',
    name: 'Nintendo Switch',
    description:
      'Consola hibrida Nintendo Switch con Joy-Con y bundle digital de Mario Kart 8.',
    priceInCents: 159900000,
    currency: 'COP',
    stock: 12,
  },
  {
    id: 'prod_nintendo_switch_2',
    name: 'Nintendo Switch 2',
    description:
      'Nueva Nintendo Switch 2 con mejoras de rendimiento y precio oficial sugerido en Colombia.',
    priceInCents: 285990000,
    currency: 'COP',
    stock: 7,
  },
]

const initialState: CatalogState = {
  products: fallbackProducts,
  selectedProductId: 'prod_ps5',
  status: 'idle',
  errorMessage: null,
}

export const fetchProducts = createAsyncThunk(
  'catalog/fetchProducts',
  async () => listProducts(),
)

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    selectProduct(state, action: { payload: string }) {
      state.selectedProductId = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
        state.errorMessage = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'

        if (action.payload.length > 0) {
          state.products = action.payload

          if (
            !action.payload.some(
              (product) => product.id === state.selectedProductId,
            )
          ) {
            state.selectedProductId = action.payload[0].id
          }
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.errorMessage =
          action.error.message ?? 'No se pudo cargar el catalogo.'
      })
  },
})

export const { selectProduct } = catalogSlice.actions
export const catalogReducer = catalogSlice.reducer

export const selectCatalogProducts = (state: RootState) => state.catalog.products
export const selectCatalogStatus = (state: RootState) => state.catalog.status
export const selectCatalogErrorMessage = (state: RootState) =>
  state.catalog.errorMessage
export const selectSelectedProduct = (state: RootState) =>
  state.catalog.products.find(
    (product) => product.id === state.catalog.selectedProductId,
  ) ?? state.catalog.products[0]
