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

const initialState: CatalogState = {
  products: [],
  selectedProductId: '',
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
  ) ?? state.catalog.products[0] ?? null
