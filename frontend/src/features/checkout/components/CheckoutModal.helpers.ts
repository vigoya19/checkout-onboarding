import type { CheckoutState } from '@/features/checkout/checkout.slice'
import type { WompiAcceptanceTokens } from '@/features/payments/payments.api'

export function sanitizeCardNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 16)
}

export function formatCardNumber(value: string) {
  return sanitizeCardNumber(value).replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export function detectCardBrand(value: string) {
  const digits = sanitizeCardNumber(value)

  if (digits.startsWith('4')) {
    return 'Visa'
  }

  if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]|7[01])/.test(digits)) {
    return 'Mastercard'
  }

  return ''
}

export function getValidationError(
  draft: CheckoutState['draft'],
  acceptanceInfo: WompiAcceptanceTokens | null,
) {
  const cardDigits = sanitizeCardNumber(draft.cardNumber)

  if (draft.customerName.trim().length <= 3) {
    return 'Agrega un nombre completo valido para la entrega.'
  }

  if (!/\S+@\S+\.\S+/.test(draft.customerEmail)) {
    return 'El correo debe tener un formato valido.'
  }

  if (draft.customerPhone.trim().length < 10) {
    return 'El telefono debe tener al menos 10 digitos.'
  }

  if (draft.addressLine.trim().length < 5) {
    return 'La direccion es muy corta para una entrega real.'
  }

  if (draft.city.trim().length <= 2) {
    return 'Ingresa una ciudad valida.'
  }

  if (draft.department.trim().length <= 2) {
    return 'Ingresa un departamento valido.'
  }

  if (draft.cardHolder.trim().length <= 3) {
    return 'El nombre del titular debe verse completo.'
  }

  if (cardDigits.length < 13) {
    return 'El numero de tarjeta esta incompleto.'
  }

  if (draft.expiryMonth.length !== 2 || draft.expiryYear.length !== 2) {
    return 'Completa mes y ano de vencimiento.'
  }

  if (draft.cvc.length < 3) {
    return 'El CVC debe tener al menos 3 digitos.'
  }

  if (!draft.acceptedTerms) {
    return 'Debes aceptar los terminos de Wompi antes de continuar.'
  }

  if (
    acceptanceInfo?.acceptPersonalAuthToken &&
    !draft.acceptedPersonalDataAuth
  ) {
    return 'Debes autorizar el tratamiento de datos personales para continuar.'
  }

  return null
}
