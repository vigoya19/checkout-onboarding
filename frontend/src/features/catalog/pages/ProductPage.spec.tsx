jest.mock('@/features/catalog/catalog.api', () => ({
  listProducts: jest.fn(),
}))

jest.mock('@/app/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}))

jest.mock('@/features/catalog/components/ProductHero', () => ({
  ProductHero: ({
    product,
  }: {
    product: { name: string } | null
  }) => <div data-testid="hero">{product ? product.name : 'empty'}</div>,
}))

jest.mock('@/features/checkout/components/CheckoutModal', () => ({
  CheckoutModal: () => <div data-testid="checkout-modal" />,
}))

jest.mock('@/features/checkout/components/SummaryBackdrop', () => ({
  SummaryBackdrop: () => <div data-testid="summary-backdrop" />,
}))

jest.mock('@/features/checkout/components/FinalStatusPanel', () => ({
  FinalStatusPanel: () => <div data-testid="final-status-panel" />,
}))

import { fireEvent, render, screen } from '@testing-library/react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { ProductPage } from '@/features/catalog/pages/ProductPage'
import { selectProduct } from '@/features/catalog/catalog.slice'
import {
  returnToCatalog,
  startCheckout,
} from '@/features/checkout/checkout.slice'

describe('ProductPage', () => {
  const baseState = {
    catalog: {
      products: [
        {
          id: 'prod_ps5',
          name: 'PlayStation 5',
          description: 'desc',
          priceInCents: 299900000,
          currency: 'COP' as const,
          stock: 5,
        },
      ],
      selectedProductId: 'prod_ps5',
      status: 'succeeded' as const,
      errorMessage: null,
    },
    checkout: {
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
    },
  }

  beforeEach(() => {
    ;(useAppDispatch as jest.Mock).mockReturnValue(jest.fn())
  })

  it('renders products and starts the flow when buying', () => {
    const dispatch = jest.fn()
    ;(useAppDispatch as jest.Mock).mockReturnValue(dispatch)
    ;(useAppSelector as jest.Mock).mockImplementation((selector: (state: typeof baseState) => unknown) =>
      selector(baseState),
    )

    render(<ProductPage />)

    expect(screen.getByTestId('hero')).toHaveTextContent('PlayStation 5')
    fireEvent.click(screen.getByRole('button', { name: 'Seleccionada' }))

    expect(dispatch).toHaveBeenCalledWith(selectProduct('prod_ps5'))
    expect(dispatch).toHaveBeenCalledWith(startCheckout())
  })

  it('renders the empty state when there are no products', () => {
    ;(useAppSelector as jest.Mock).mockImplementation((selector: (state: typeof baseState) => unknown) =>
      selector({
        ...baseState,
        catalog: {
          ...baseState.catalog,
          products: [],
          selectedProductId: '',
        },
      }),
    )

    render(<ProductPage />)

    expect(
      screen.getByText('No hay productos para iniciar el checkout'),
    ).toBeInTheDocument()
  })

  it('shows modal, summary and final panels according to the current step', () => {
    ;(useAppSelector as jest.Mock).mockImplementation((selector: (state: typeof baseState) => unknown) =>
      selector({
        ...baseState,
        checkout: {
          ...baseState.checkout,
          currentStep: 2,
          result: 'success',
        },
      }),
    )

    const { rerender } = render(<ProductPage />)
    expect(screen.getByTestId('checkout-modal')).toBeInTheDocument()

    ;(useAppSelector as jest.Mock).mockImplementation((selector: (state: typeof baseState) => unknown) =>
      selector({
        ...baseState,
        checkout: {
          ...baseState.checkout,
          currentStep: 3,
          result: null,
        },
      }),
    )
    rerender(<ProductPage />)
    expect(screen.getByTestId('summary-backdrop')).toBeInTheDocument()

    ;(useAppSelector as jest.Mock).mockImplementation((selector: (state: typeof baseState) => unknown) =>
      selector({
        ...baseState,
        checkout: {
          ...baseState.checkout,
          currentStep: 4,
          result: 'success',
        },
      }),
    )
    rerender(<ProductPage />)
    expect(screen.getByTestId('final-status-panel')).toBeInTheDocument()
  })

  it('loads products on idle and refreshes when returning to the catalog', () => {
    const dispatch = jest.fn()
    ;(useAppDispatch as jest.Mock).mockReturnValue(dispatch)
    ;(useAppSelector as jest.Mock).mockImplementation((selector: (state: typeof baseState) => unknown) =>
      selector({
        ...baseState,
        catalog: {
          ...baseState.catalog,
          status: 'idle',
        },
      }),
    )

    render(<ProductPage />)

    expect(dispatch).toHaveBeenCalledWith(expect.any(Function))

    fireEvent.click(screen.getByRole('button', { name: 'Volver al paso 1' }))
    expect(dispatch).toHaveBeenCalledWith(returnToCatalog())
  })
})
