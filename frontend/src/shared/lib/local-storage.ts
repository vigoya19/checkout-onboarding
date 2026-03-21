import {
  initialCheckoutState,
  type CheckoutState,
} from '@/features/checkout/checkout.slice'

const CHECKOUT_STORAGE_KEY = 'checkout-onboarding:checkout'

export function loadCheckoutState(): CheckoutState {
  const snapshot = window.localStorage.getItem(CHECKOUT_STORAGE_KEY)

  if (!snapshot) {
    return initialCheckoutState
  }

  try {
    return JSON.parse(snapshot) as CheckoutState
  } catch {
    window.localStorage.removeItem(CHECKOUT_STORAGE_KEY)

    return initialCheckoutState
  }
}

export function saveCheckoutState(checkoutState: CheckoutState) {
  window.localStorage.setItem(
    CHECKOUT_STORAGE_KEY,
    JSON.stringify(checkoutState),
  )
}
