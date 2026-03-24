import {
  loadCheckoutState,
  saveCheckoutState,
} from '@/shared/lib/local-storage'
import { initialCheckoutState } from '@/features/checkout/checkout.slice'

describe('local-storage helpers', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns the initial state when nothing is stored', () => {
    expect(loadCheckoutState()).toEqual(initialCheckoutState)
  })

  it('migrates old fee snapshots stored in pesos', () => {
    window.localStorage.setItem(
      'checkout-onboarding:checkout',
      JSON.stringify({
        ...initialCheckoutState,
        draft: {
          ...initialCheckoutState.draft,
          baseFeeInCents: 3900,
          deliveryFeeInCents: 9900,
        },
      }),
    )

    const loaded = loadCheckoutState()

    expect(loaded.pricing.baseFeeInCents).toBe(390000)
    expect(loaded.pricing.deliveryFeeInCents).toBe(990000)
  })

  it('falls back when stored fees are invalid', () => {
    window.localStorage.setItem(
      'checkout-onboarding:checkout',
      JSON.stringify({
        ...initialCheckoutState,
        draft: {
          ...initialCheckoutState.draft,
          baseFeeInCents: 0,
          deliveryFeeInCents: Number.NaN,
        },
      }),
    )

    const loaded = loadCheckoutState()

    expect(loaded.pricing.baseFeeInCents).toBe(
      initialCheckoutState.pricing.baseFeeInCents,
    )
    expect(loaded.pricing.deliveryFeeInCents).toBe(
      initialCheckoutState.pricing.deliveryFeeInCents,
    )
  })

  it('keeps fee values already stored in centavos', () => {
    window.localStorage.setItem(
      'checkout-onboarding:checkout',
      JSON.stringify({
        ...initialCheckoutState,
        pricing: {
          ...initialCheckoutState.pricing,
          baseFeeInCents: 390000,
          deliveryFeeInCents: 990000,
        },
      }),
    )

    const loaded = loadCheckoutState()

    expect(loaded.pricing.baseFeeInCents).toBe(390000)
    expect(loaded.pricing.deliveryFeeInCents).toBe(990000)
  })

  it('clears invalid snapshots', () => {
    window.localStorage.setItem('checkout-onboarding:checkout', '{bad-json')

    expect(loadCheckoutState()).toEqual(initialCheckoutState)
    expect(window.localStorage.getItem('checkout-onboarding:checkout')).toBeNull()
  })

  it('persists checkout state', () => {
    saveCheckoutState({
      ...initialCheckoutState,
      currentStep: 3,
    })

    expect(window.localStorage.getItem('checkout-onboarding:checkout')).toContain(
      '"currentStep":3',
    )
  })
})
