jest.mock('@/app/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}))

jest.mock('@/features/payments/payments.api', () => ({
  getAcceptanceTokens: jest.fn(),
  tokenizeCard: jest.fn(),
}))

jest.mock('@/features/transactions/transactions.api', () => ({
  createTransaction: jest.fn(),
  getTransaction: jest.fn(),
  payTransaction: jest.fn(),
}))

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  backToPayment,
  completeCheckout,
  failPaymentSubmission,
  initialCheckoutState,
  startPaymentSubmission,
} from '@/features/checkout/checkout.slice'
import {
  getAcceptanceTokens,
  tokenizeCard,
} from '@/features/payments/payments.api'
import {
  createTransaction,
  payTransaction,
} from '@/features/transactions/transactions.api'
import { SummaryBackdrop } from '@/features/checkout/components/SummaryBackdrop'

describe('SummaryBackdrop', () => {
  const product = {
    id: 'prod_ps5',
    name: 'PlayStation 5',
    description: 'desc',
    priceInCents: 299900000,
    currency: 'COP' as const,
    stock: 5,
  }

  const draft = {
    ...initialCheckoutState.draft,
    baseFeeInCents: 390000,
    deliveryFeeInCents: 990000,
    customerName: 'Andres',
    customerEmail: 'andres@example.com',
    customerPhone: '3001234567',
    addressLine: 'Cra 1 # 2 - 3',
    city: 'Barranquilla',
    department: 'Atlantico',
    cardHolder: 'Andres',
    cardNumber: '4242 4242 4242 4242',
    expiryMonth: '08',
    expiryYear: '29',
    cvc: '123',
    cardBrand: 'Visa',
  }

  beforeEach(() => {
    ;(useAppDispatch as jest.Mock).mockReturnValue(jest.fn())
    ;(useAppSelector as jest.Mock).mockReturnValue(false)
  })

  it('processes a successful payment', async () => {
    const dispatch = jest.fn()
    ;(useAppDispatch as jest.Mock).mockReturnValue(dispatch)
    ;(getAcceptanceTokens as jest.Mock).mockResolvedValue({
      acceptanceToken: 'acc',
      acceptPersonalAuthToken: null,
    })
    ;(tokenizeCard as jest.Mock).mockResolvedValue({ tokenId: 'tok_1' })
    ;(createTransaction as jest.Mock).mockResolvedValue({
      transactionId: 'tx-1',
    })
    ;(payTransaction as jest.Mock).mockResolvedValue({
      reference: 'tx-1',
      paymentStatus: 'APPROVED',
      fulfillmentStatus: 'COMPLETED',
      paymentStatusMessage: 'Aprobada',
    })

    render(<SummaryBackdrop draft={draft} product={product} />)

    fireEvent.click(screen.getByRole('button', { name: 'Pagar con tarjeta' }))

    await waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith(startPaymentSubmission()),
    )
    await waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith(
        completeCheckout({
          result: 'success',
          statusMessage: 'Aprobada',
          transactionReference: 'tx-1',
        }),
      ),
    )
  })

  it('surfaces payment errors', async () => {
    const dispatch = jest.fn()
    ;(useAppDispatch as jest.Mock).mockReturnValue(dispatch)
    ;(getAcceptanceTokens as jest.Mock).mockRejectedValue(new Error('boom'))

    render(<SummaryBackdrop draft={draft} product={product} />)

    fireEvent.click(screen.getByRole('button', { name: 'Pagar con tarjeta' }))

    await waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith(failPaymentSubmission('boom')),
    )
  })

  it('returns to the payment step', () => {
    const dispatch = jest.fn()
    ;(useAppDispatch as jest.Mock).mockReturnValue(dispatch)

    render(<SummaryBackdrop draft={draft} product={product} />)

    fireEvent.click(screen.getByRole('button', { name: 'Editar informacion' }))
    expect(dispatch).toHaveBeenCalledWith(backToPayment())
  })

  it('shows a richer processing state while the payment is running', () => {
    ;(useAppSelector as jest.Mock).mockImplementation((selector: unknown) => {
      if (typeof selector !== 'function') {
        return null
      }

      return selector({
        checkout: {
          ...initialCheckoutState,
          isSubmittingPayment: true,
          paymentError: null,
        },
      })
    })

    render(<SummaryBackdrop draft={draft} product={product} />)

    expect(screen.getByText('Estamos procesando tu pago')).toBeInTheDocument()
    expect(
      screen.getByText('Tokenizando la tarjeta en Wompi'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Confirmando pago...' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Editar informacion' }),
    ).toBeDisabled()
  })
})
