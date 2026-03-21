import {
  initialCheckoutState,
  type CheckoutState,
} from '@/features/checkout/checkout.slice'

const CHECKOUT_STORAGE_KEY = 'checkout-onboarding:checkout'

function normalizeFeeAmount(value: number, fallback: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback
  }

  // Migra snapshots viejos donde las fees estaban guardadas en pesos y no en centavos.
  if (value < 100_000) {
    return value * 100
  }

  return value
}

function normalizeCheckoutState(snapshot: CheckoutState): CheckoutState {
  return {
    ...initialCheckoutState,
    ...snapshot,
    draft: {
      ...initialCheckoutState.draft,
      ...snapshot.draft,
      baseFeeInCents: normalizeFeeAmount(
        snapshot.draft?.baseFeeInCents ?? initialCheckoutState.draft.baseFeeInCents,
        initialCheckoutState.draft.baseFeeInCents,
      ),
      deliveryFeeInCents: normalizeFeeAmount(
        snapshot.draft?.deliveryFeeInCents ??
          initialCheckoutState.draft.deliveryFeeInCents,
        initialCheckoutState.draft.deliveryFeeInCents,
      ),
    },
  }
}

export function loadCheckoutState(): CheckoutState {
  const snapshot = window.localStorage.getItem(CHECKOUT_STORAGE_KEY)

  if (!snapshot) {
    return initialCheckoutState
  }

  try {
    return normalizeCheckoutState(JSON.parse(snapshot) as CheckoutState)
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
