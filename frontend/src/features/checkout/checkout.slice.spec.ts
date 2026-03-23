import {
  backToPayment,
  checkoutReducer,
  completeCheckout,
  failPaymentSubmission,
  initialCheckoutState,
  openSummary,
  returnToCatalog,
  startCheckout,
  startPaymentSubmission,
  updateCheckoutDraft,
} from '@/features/checkout/checkout.slice'

describe('checkout.slice', () => {
  it('starts the checkout on step 2', () => {
    const state = checkoutReducer(undefined, startCheckout())

    expect(state.currentStep).toBe(2)
    expect(state.result).toBeNull()
  })

  it('updates the draft partially', () => {
    const state = checkoutReducer(
      undefined,
      updateCheckoutDraft({ customerName: 'Andres', city: 'Barranquilla' }),
    )

    expect(state.draft.customerName).toBe('Andres')
    expect(state.draft.city).toBe('Barranquilla')
  })

  it('moves from payment to summary and back', () => {
    const summary = checkoutReducer(undefined, openSummary())
    const payment = checkoutReducer(summary, backToPayment())

    expect(summary.currentStep).toBe(3)
    expect(payment.currentStep).toBe(2)
  })

  it('tracks payment submission errors', () => {
    const submitting = checkoutReducer(undefined, startPaymentSubmission())
    const failed = checkoutReducer(
      submitting,
      failPaymentSubmission('No fue posible cobrar'),
    )

    expect(submitting.isSubmittingPayment).toBe(true)
    expect(failed.isSubmittingPayment).toBe(false)
    expect(failed.paymentError).toBe('No fue posible cobrar')
  })

  it('stores the final result', () => {
    const state = checkoutReducer(
      initialCheckoutState,
      completeCheckout({
        result: 'success',
        statusMessage: 'Aprobado',
        transactionReference: 'tx-1',
      }),
    )

    expect(state.currentStep).toBe(4)
    expect(state.result).toBe('success')
    expect(state.transactionReference).toBe('tx-1')
  })

  it('returns to catalog and clears transient fields', () => {
    const state = checkoutReducer(
      {
        ...initialCheckoutState,
        currentStep: 4,
        result: 'failure',
        statusMessage: 'rechazado',
        transactionReference: 'tx-1',
        isSubmittingPayment: true,
        paymentError: 'boom',
      },
      returnToCatalog(),
    )

    expect(state.currentStep).toBe(1)
    expect(state.result).toBeNull()
    expect(state.transactionReference).toBeNull()
    expect(state.isSubmittingPayment).toBe(false)
    expect(state.paymentError).toBeNull()
  })
})
