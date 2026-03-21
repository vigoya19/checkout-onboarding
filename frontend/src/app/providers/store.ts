import { configureStore } from '@reduxjs/toolkit'
import { catalogReducer } from '@/features/catalog/catalog.slice'
import { checkoutReducer } from '@/features/checkout/checkout.slice'
import { loadCheckoutState, saveCheckoutState } from '@/shared/lib/local-storage'

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    checkout: checkoutReducer,
  },
  preloadedState: {
    checkout: loadCheckoutState(),
  },
})

export function setupStorePersistence() {
  store.subscribe(() => {
    saveCheckoutState(store.getState().checkout)
  })
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
