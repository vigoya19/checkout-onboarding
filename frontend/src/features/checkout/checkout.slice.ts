import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/app/providers/store'

export type CheckoutState = {
  currentStep: number
  draft: {
    baseFeeInCents: number
    deliveryFeeInCents: number
    customerName: string
    customerEmail: string
    address: string
  }
}

export const initialCheckoutState: CheckoutState = {
  currentStep: 1,
  draft: {
    baseFeeInCents: 390000,
    deliveryFeeInCents: 990000,
    customerName: '',
    customerEmail: '',
    address: '',
  },
}

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: initialCheckoutState,
  reducers: {
    advanceStep(state) {
      state.currentStep = Math.min(state.currentStep + 1, 4)
    },
    startCheckout(state) {
      state.currentStep = 2
    },
    returnToCatalog(state) {
      state.currentStep = 1
    },
  },
})

export const { advanceStep, returnToCatalog, startCheckout } =
  checkoutSlice.actions
export const checkoutReducer = checkoutSlice.reducer

export const selectCheckoutStep = (state: RootState) => state.checkout.currentStep
export const selectCheckoutDraft = (state: RootState) => state.checkout.draft
