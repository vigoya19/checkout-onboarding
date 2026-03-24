import {
  initialCheckoutState,
  type CheckoutState,
} from '@/features/checkout/checkout.slice'

const CHECKOUT_STORAGE_KEY = 'checkout-onboarding:checkout'

function normalizeFeeAmount(value: number | string, fallback: number) {
  const normalizedValue =
    typeof value === 'string' ? Number.parseInt(value, 10) : value

  if (!Number.isFinite(normalizedValue) || normalizedValue < 0) {
    return fallback
  }

  if (normalizedValue < 100_000) {
    return normalizedValue * 100
  }

  return normalizedValue
}

type LegacyCheckoutSnapshot = Partial<CheckoutState> & {
  draft?: Partial<CheckoutState['draft']> & {
    baseFeeInCents?: number | string
    deliveryFeeInCents?: number | string
  }
  pricing?: Partial<
    Omit<CheckoutState['pricing'], 'baseFeeInCents' | 'deliveryFeeInCents'>
  > & {
    baseFeeInCents?: number | string
    deliveryFeeInCents?: number | string
  }
}

function normalizeCheckoutState(snapshot: LegacyCheckoutSnapshot): CheckoutState {
  const legacyBaseFee = snapshot.draft?.baseFeeInCents
  const legacyDeliveryFee = snapshot.draft?.deliveryFeeInCents
  const storedPricingBaseFee = snapshot.pricing?.baseFeeInCents
  const storedPricingDeliveryFee = snapshot.pricing?.deliveryFeeInCents
  const normalizedPricingBaseFee = normalizeFeeAmount(
    storedPricingBaseFee ?? initialCheckoutState.pricing.baseFeeInCents,
    initialCheckoutState.pricing.baseFeeInCents,
  )
  const normalizedPricingDeliveryFee = normalizeFeeAmount(
    storedPricingDeliveryFee ??
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
  const baseFeeInCents =
    (storedPricingBaseFee == null || normalizedPricingBaseFee === 0) &&
    normalizedLegacyBaseFee > 0
      ? normalizedLegacyBaseFee
      : normalizedPricingBaseFee
  const deliveryFeeInCents =
    (storedPricingDeliveryFee == null || normalizedPricingDeliveryFee === 0) &&
    normalizedLegacyDeliveryFee > 0
      ? normalizedLegacyDeliveryFee
      : normalizedPricingDeliveryFee

  return {
    ...initialCheckoutState,
    ...snapshot,
    pricing: {
      ...initialCheckoutState.pricing,
      ...snapshot.pricing,
      baseFeeInCents,
      deliveryFeeInCents,
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
