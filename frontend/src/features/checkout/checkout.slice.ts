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
    baseFeeInCents: 3900,
    deliveryFeeInCents: 9900,
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
  },
})

export const { advanceStep } = checkoutSlice.actions
export const checkoutReducer = checkoutSlice.reducer

export const selectCheckoutStep = (state: RootState) => state.checkout.currentStep
export const selectCheckoutDraft = (state: RootState) => state.checkout.draft
