import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/app/providers/store'

export type CheckoutResult = 'success' | 'failure' | 'pending' | null

export type CheckoutState = {
  currentStep: number
  result: CheckoutResult
  statusMessage: string
  transactionReference: string | null
  isSubmittingPayment: boolean
  paymentError: string | null
  draft: {
    baseFeeInCents: number
    deliveryFeeInCents: number
    customerName: string
    customerEmail: string
    customerPhone: string
    addressLine: string
    city: string
    department: string
    cardHolder: string
    cardNumber: string
    expiryMonth: string
    expiryYear: string
    cvc: string
    cardBrand: string
    acceptedTerms: boolean
    acceptedPersonalDataAuth: boolean
  }
}

export const initialCheckoutState: CheckoutState = {
  currentStep: 1,
  result: null,
  statusMessage: '',
  transactionReference: null,
  isSubmittingPayment: false,
  paymentError: null,
  draft: {
    baseFeeInCents: 390000,
    deliveryFeeInCents: 990000,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    addressLine: '',
    city: '',
    department: '',
    cardHolder: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardBrand: '',
    acceptedTerms: false,
    acceptedPersonalDataAuth: false,
  },
}

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: initialCheckoutState,
  reducers: {
    startCheckout(state) {
      state.currentStep = 2
      state.result = null
      state.statusMessage = ''
      state.transactionReference = null
      state.paymentError = null
    },
    returnToCatalog(state) {
      state.currentStep = 1
      state.result = null
      state.statusMessage = ''
      state.transactionReference = null
      state.isSubmittingPayment = false
      state.paymentError = null
    },
    updateCheckoutDraft(
      state,
      action: {
        payload: Partial<CheckoutState['draft']>
      },
    ) {
      state.draft = {
        ...state.draft,
        ...action.payload,
      }
    },
    openSummary(state) {
      state.currentStep = 3
      state.paymentError = null
    },
    backToPayment(state) {
      state.currentStep = 2
      state.paymentError = null
    },
    startPaymentSubmission(state) {
      state.isSubmittingPayment = true
      state.paymentError = null
    },
    failPaymentSubmission(
      state,
      action: {
        payload: string
      },
    ) {
      state.isSubmittingPayment = false
      state.paymentError = action.payload
    },
    completeCheckout(
      state,
      action: {
        payload: {
          result: Exclude<CheckoutResult, null>
          statusMessage: string
          transactionReference: string
        }
      },
    ) {
      state.currentStep = 4
      state.isSubmittingPayment = false
      state.paymentError = null
      state.result = action.payload.result
      state.statusMessage = action.payload.statusMessage
      state.transactionReference = action.payload.transactionReference
    },
  },
})

export const {
  backToPayment,
  completeCheckout,
  failPaymentSubmission,
  openSummary,
  returnToCatalog,
  startPaymentSubmission,
  startCheckout,
  updateCheckoutDraft,
} = checkoutSlice.actions
export const checkoutReducer = checkoutSlice.reducer

export const selectCheckoutStep = (state: RootState) => state.checkout.currentStep
export const selectCheckoutDraft = (state: RootState) => state.checkout.draft
export const selectCheckoutResult = (state: RootState) => state.checkout.result
export const selectCheckoutStatusMessage = (state: RootState) =>
  state.checkout.statusMessage
export const selectCheckoutTransactionReference = (state: RootState) =>
  state.checkout.transactionReference
export const selectIsSubmittingPayment = (state: RootState) =>
  state.checkout.isSubmittingPayment
export const selectPaymentError = (state: RootState) =>
  state.checkout.paymentError
