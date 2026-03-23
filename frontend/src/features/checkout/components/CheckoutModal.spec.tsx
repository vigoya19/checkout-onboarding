jest.mock('@/app/hooks', () => ({
  useAppDispatch: jest.fn(),
}))

jest.mock('@/features/payments/payments.api', () => ({
  getAcceptanceTokens: jest.fn(),
}))

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useAppDispatch } from '@/app/hooks'
import { initialCheckoutState, openSummary } from '@/features/checkout/checkout.slice'
import { getAcceptanceTokens } from '@/features/payments/payments.api'
import { CheckoutModal } from '@/features/checkout/components/CheckoutModal'

describe('CheckoutModal', () => {
  beforeEach(() => {
    ;(useAppDispatch as jest.Mock).mockReturnValue(jest.fn())
    ;(getAcceptanceTokens as jest.Mock).mockResolvedValue({
      acceptanceToken: 'acc',
      acceptancePermalink: 'https://wompi.test/terms',
      acceptPersonalAuthToken: 'auth',
      acceptPersonalAuthPermalink: 'https://wompi.test/data',
    })
  })

  it('shows validation errors when the form is incomplete', async () => {
    render(
      <CheckoutModal
        draft={initialCheckoutState.draft}
        onClose={jest.fn()}
      />,
    )

    await waitFor(() =>
      expect(getAcceptanceTokens).toHaveBeenCalled(),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Continuar al resumen' }))

    expect(
      screen.getByText('Agrega un nombre completo valido para la entrega.'),
    ).toBeInTheDocument()
  })

  it('dispatches draft updates from the form fields and closes the modal', async () => {
    const dispatch = jest.fn()
    const onClose = jest.fn()
    ;(useAppDispatch as jest.Mock).mockReturnValue(dispatch)

    render(
      <CheckoutModal
        draft={initialCheckoutState.draft}
        onClose={onClose}
      />,
    )

    await waitFor(() =>
      expect(getAcceptanceTokens).toHaveBeenCalled(),
    )

    fireEvent.change(screen.getAllByPlaceholderText('Andres Pineda')[0], {
      target: { value: 'Andres Pineda' },
    })
    fireEvent.change(screen.getByPlaceholderText('4242 4242 4242 4242'), {
      target: { value: '4242 4242 4242 4242' },
    })
    fireEvent.change(screen.getByPlaceholderText('08'), {
      target: { value: '08' },
    })
    fireEvent.change(screen.getByPlaceholderText('29'), {
      target: { value: '29' },
    })
    fireEvent.change(screen.getByPlaceholderText('123'), {
      target: { value: '123' },
    })
    fireEvent.change(screen.getAllByPlaceholderText('Andres Pineda')[1], {
      target: { value: 'Andres Pineda' },
    })
    fireEvent.change(screen.getByPlaceholderText('correo@ejemplo.com'), {
      target: { value: 'andres@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('3001234567'), {
      target: { value: '3001234567' },
    })
    fireEvent.change(screen.getByPlaceholderText('Cra 10 # 24 - 18'), {
      target: { value: 'Cra 10 # 24 - 18' },
    })
    fireEvent.change(screen.getByPlaceholderText('Barranquilla'), {
      target: { value: 'Barranquilla' },
    })
    fireEvent.change(screen.getByPlaceholderText('Atlantico'), {
      target: { value: 'Atlantico' },
    })

    fireEvent.click(screen.getAllByRole('checkbox')[0])
    fireEvent.click(screen.getAllByRole('checkbox')[1])
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Volver al catalogo' }))

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'checkout/updateCheckoutDraft',
      }),
    )
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('detects the card brand and advances to summary when the form is valid', async () => {
    const dispatch = jest.fn()
    ;(useAppDispatch as jest.Mock).mockReturnValue(dispatch)
    const validDraft = {
      ...initialCheckoutState.draft,
      customerName: 'Andres Pineda',
      customerEmail: 'andres@example.com',
      customerPhone: '3001234567',
      addressLine: 'Cra 10 # 24 - 18',
      city: 'Barranquilla',
      department: 'Atlantico',
      cardHolder: 'Andres Pineda',
      cardNumber: '4242 4242 4242 4242',
      expiryMonth: '08',
      expiryYear: '29',
      cvc: '123',
      acceptedTerms: true,
      acceptedPersonalDataAuth: true,
    }

    render(
      <CheckoutModal
        draft={validDraft}
        onClose={jest.fn()}
      />,
    )

    await waitFor(() =>
      expect(screen.getByText('terminos y condiciones')).toBeInTheDocument(),
    )

    expect(screen.getByText('Visa')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Continuar al resumen' }))

    await waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'checkout/updateCheckoutDraft',
          payload: { cardBrand: 'Visa' },
        }),
      ),
    )
    await waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith(openSummary()),
    )
  })
})
