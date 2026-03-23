import {
  detectCardBrand,
  formatCardNumber,
  getValidationError,
  sanitizeCardNumber,
} from '@/features/checkout/components/CheckoutModal.helpers'
import { initialCheckoutState } from '@/features/checkout/checkout.slice'

describe('CheckoutModal helpers', () => {
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

  it('sanitizes and formats card numbers', () => {
    expect(sanitizeCardNumber('4242-4242-4242-4242xxxx')).toBe('4242424242424242')
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242')
  })

  it('detects Visa and Mastercard', () => {
    expect(detectCardBrand('4242 4242 4242 4242')).toBe('Visa')
    expect(detectCardBrand('5555 5555 5555 4444')).toBe('Mastercard')
    expect(detectCardBrand('9999')).toBe('')
  })

  it.each([
    ['customerName', { customerName: 'An' }, 'Agrega un nombre completo valido para la entrega.'],
    ['customerEmail', { customerEmail: 'correo-invalido' }, 'El correo debe tener un formato valido.'],
    ['customerPhone', { customerPhone: '123' }, 'El telefono debe tener al menos 10 digitos.'],
    ['addressLine', { addressLine: 'Cra' }, 'La direccion es muy corta para una entrega real.'],
    ['city', { city: 'Ba' }, 'Ingresa una ciudad valida.'],
    ['department', { department: 'At' }, 'Ingresa un departamento valido.'],
    ['cardHolder', { cardHolder: 'An' }, 'El nombre del titular debe verse completo.'],
    ['cardNumber', { cardNumber: '4242' }, 'El numero de tarjeta esta incompleto.'],
    ['expiry', { expiryMonth: '8', expiryYear: '29' }, 'Completa mes y ano de vencimiento.'],
    ['cvc', { cvc: '12' }, 'El CVC debe tener al menos 3 digitos.'],
    ['terms', { acceptedTerms: false }, 'Debes aceptar los terminos de Wompi antes de continuar.'],
  ])('returns validation errors for %s', (_label, patch, expected) => {
    expect(
      getValidationError(
        {
          ...validDraft,
          ...patch,
        },
        null,
      ),
    ).toBe(expected)
  })

  it('requires personal data authorization when Wompi demands it', () => {
    expect(
      getValidationError(
        {
          ...validDraft,
          acceptedPersonalDataAuth: false,
        },
        {
          acceptanceToken: 'acc',
          acceptancePermalink: null,
          acceptPersonalAuthToken: 'auth',
          acceptPersonalAuthPermalink: null,
        },
      ),
    ).toBe(
      'Debes autorizar el tratamiento de datos personales para continuar.',
    )
  })

  it('returns null when the form is valid', () => {
    expect(
      getValidationError(validDraft, {
        acceptanceToken: 'acc',
        acceptancePermalink: null,
        acceptPersonalAuthToken: 'auth',
        acceptPersonalAuthPermalink: null,
      }),
    ).toBeNull()
  })
})
