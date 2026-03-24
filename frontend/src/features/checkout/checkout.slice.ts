import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/app/providers/store'
import { getCheckoutConfig } from '@/features/payments/payments.api'

export type CheckoutResult = 'success' | 'failure' | 'pending' | null

export type CheckoutState = {
  currentStep: number
  result: CheckoutResult
  statusMessage: string
  transactionReference: string | null
  isSubmittingPayment: boolean
  paymentError: string | null
  pricing: {
    baseFeeInCents: number
    deliveryFeeInCents: number
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    errorMessage: string | null
  }
  draft: {
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
  pricing: {
    baseFeeInCents: 0,
    deliveryFeeInCents: 0,
    status: 'idle',
    errorMessage: null,
  },
  draft: {
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

export const fetchCheckoutConfig = createAsyncThunk(
  'checkout/fetchCheckoutConfig',
  async () => getCheckoutConfig(),
)

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchCheckoutConfig.pending, (state) => {
        state.pricing.status = 'loading'
        state.pricing.errorMessage = null
      })
      .addCase(fetchCheckoutConfig.fulfilled, (state, action) => {
        state.pricing.status = 'succeeded'
        state.pricing.errorMessage = null
        state.pricing.baseFeeInCents = action.payload.baseFeeInCents
        state.pricing.deliveryFeeInCents = action.payload.deliveryFeeInCents
      })
      .addCase(fetchCheckoutConfig.rejected, (state, action) => {
        state.pricing.status = 'failed'
        state.pricing.errorMessage =
          action.error.message ?? 'No se pudo cargar la configuracion del checkout.'
      })
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
export const selectCheckoutPricing = (state: RootState) => state.checkout.pricing
export const selectCheckoutConfigStatus = (state: RootState) =>
  state.checkout.pricing.status
export const selectCheckoutConfigError = (state: RootState) =>
  state.checkout.pricing.errorMessage
export const selectCheckoutResult = (state: RootState) => state.checkout.result
export const selectCheckoutStatusMessage = (state: RootState) =>
  state.checkout.statusMessage
export const selectCheckoutTransactionReference = (state: RootState) =>
  state.checkout.transactionReference
export const selectIsSubmittingPayment = (state: RootState) =>
  state.checkout.isSubmittingPayment
export const selectPaymentError = (state: RootState) =>
  state.checkout.paymentError
