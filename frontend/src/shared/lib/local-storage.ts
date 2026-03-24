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

type LegacyCheckoutSnapshot = Partial<CheckoutState> & {
  pricing?: Partial<CheckoutState['pricing']>
  draft?: Partial<CheckoutState['draft']> & {
    baseFeeInCents?: number
    deliveryFeeInCents?: number
  }
}

function normalizeCheckoutState(snapshot: LegacyCheckoutSnapshot): CheckoutState {
  const legacyBaseFee = snapshot.draft?.baseFeeInCents
  const legacyDeliveryFee = snapshot.draft?.deliveryFeeInCents
  const normalizedPricingBaseFee = normalizeFeeAmount(
    snapshot.pricing?.baseFeeInCents ??
      initialCheckoutState.pricing.baseFeeInCents,
    initialCheckoutState.pricing.baseFeeInCents,
  )
  const normalizedPricingDeliveryFee = normalizeFeeAmount(
    snapshot.pricing?.deliveryFeeInCents ??
      initialCheckoutState.pricing.deliveryFeeInCents,
    initialCheckoutState.pricing.deliveryFeeInCents,
  )
  const normalizedLegacyBaseFee = normalizeFeeAmount(
    legacyBaseFee ?? initialCheckoutState.pricing.baseFeeInCents,
    initialCheckoutState.pricing.baseFeeInCents,
  )
  const normalizedLegacyDeliveryFee = normalizeFeeAmount(
    legacyDeliveryFee ?? initialCheckoutState.pricing.deliveryFeeInCents,
    initialCheckoutState.pricing.deliveryFeeInCents,
  )

  return {
    ...initialCheckoutState,
    ...snapshot,
    pricing: {
      ...initialCheckoutState.pricing,
      ...snapshot.pricing,
      baseFeeInCents:
        normalizedPricingBaseFee || normalizedLegacyBaseFee,
      deliveryFeeInCents:
        normalizedPricingDeliveryFee || normalizedLegacyDeliveryFee,
    },
    draft: {
      ...initialCheckoutState.draft,
      ...snapshot.draft,
    },
  }
}

export function loadCheckoutState(): CheckoutState {
  const snapshot = window.localStorage.getItem(CHECKOUT_STORAGE_KEY)

  if (!snapshot) {
    return initialCheckoutState
  }

  try {
    return normalizeCheckoutState(JSON.parse(snapshot) as LegacyCheckoutSnapshot)
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
