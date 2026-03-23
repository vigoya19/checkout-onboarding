import { useEffect, useMemo, useState } from 'react'
import {
  detectCardBrand,
  formatCardNumber,
  getValidationError,
} from '@/features/checkout/components/CheckoutModal.helpers'
import {
  openSummary,
  type CheckoutState,
  updateCheckoutDraft,
} from '@/features/checkout/checkout.slice'
import { useAppDispatch } from '@/app/hooks'
import {
  getAcceptanceTokens,
  type WompiAcceptanceTokens,
} from '@/features/payments/payments.api'

type CheckoutModalProps = {
  draft: CheckoutState['draft']
  onClose: () => void
}

function CardBrandBadge({ brand }: { brand: string }) {
  if (brand === 'Visa') {
    return (
      <span className="brand-pill visa">
        <svg
          aria-hidden="true"
          className="brand-pill-logo"
          viewBox="0 0 48 16"
        >
          <text x="1" y="12" fontSize="12" fontWeight="800">
            VISA
          </text>
        </svg>
        <span>Visa</span>
      </span>
    )
  }

  if (brand === 'Mastercard') {
    return (
      <span className="brand-pill mastercard">
        <svg
          aria-hidden="true"
          className="brand-pill-logo"
          viewBox="0 0 44 16"
        >
          <circle cx="17" cy="8" fill="#eb001b" r="6" />
          <circle cx="27" cy="8" fill="#f79e1b" fillOpacity="0.92" r="6" />
        </svg>
        <span>Mastercard</span>
      </span>
    )
  }

  return <span className="brand-pill">{brand || 'Tarjeta'}</span>
}

export function CheckoutModal({ draft, onClose }: CheckoutModalProps) {
  const dispatch = useAppDispatch()
  const [showErrors, setShowErrors] = useState(false)
  const [acceptanceInfo, setAcceptanceInfo] =
    useState<WompiAcceptanceTokens | null>(null)
  const [acceptanceError, setAcceptanceError] = useState<string | null>(null)

  const cardBrand = useMemo(
    () => detectCardBrand(draft.cardNumber) || draft.cardBrand,
    [draft.cardBrand, draft.cardNumber],
  )

  useEffect(() => {
    let isMounted = true

    void getAcceptanceTokens()
      .then((response) => {
        if (isMounted) {
          setAcceptanceInfo(response)
          setAcceptanceError(null)
        }
      })
      .catch(() => {
        if (isMounted) {
          setAcceptanceError(
            'No pudimos cargar los contratos de Wompi. Igual puedes seguir probando el formulario, pero ese paso debe quedar integrado.',
          )
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const validationError = useMemo(
    () => getValidationError(draft, acceptanceInfo),
    [acceptanceInfo, draft],
  )
  const isValid = !validationError

  const updateDraftField = (payload: Partial<CheckoutState['draft']>) => {
    dispatch(updateCheckoutDraft(payload))
  }

  const handleContinue = () => {
    if (!isValid) {
      setShowErrors(true)
      return
    }

    dispatch(
      updateCheckoutDraft({
        cardBrand,
      }),
    )
    dispatch(openSummary())
  }

  return (
    <div className="overlay-shell" role="presentation">
      <div className="overlay-backdrop" onClick={onClose} />

      <section
        aria-labelledby="checkout-modal-title"
        aria-modal="true"
        className="overlay-panel modal-panel"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Paso 2</p>
            <h2 id="checkout-modal-title">Tarjeta y datos de entrega</h2>
          </div>
          <button className="icon-button" onClick={onClose} type="button">
            Cerrar
          </button>
        </div>

        <div className="modal-grid">
          <section className="modal-section">
            <div className="section-heading compact">
              <p className="eyebrow">Pago</p>
              <h3>Informacion de la tarjeta</h3>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Nombre del titular</span>
                <input
                  onChange={(event) =>
                    updateDraftField({ cardHolder: event.target.value })
                  }
                  placeholder="Andres Pineda"
                  type="text"
                  value={draft.cardHolder}
                />
              </label>

              <label className="field field-wide">
                <span>Numero de tarjeta</span>
                <div className="card-input-row">
                  <input
                    inputMode="numeric"
                    onChange={(event) =>
                      updateDraftField({
                        cardNumber: formatCardNumber(event.target.value),
                        cardBrand: detectCardBrand(event.target.value),
                      })
                    }
                    placeholder="4242 4242 4242 4242"
                    type="text"
                    value={draft.cardNumber}
                  />
                  <CardBrandBadge brand={cardBrand || 'Tarjeta'} />
                </div>
              </label>

              <label className="field">
                <span>Mes</span>
                <input
                  inputMode="numeric"
                  maxLength={2}
                  onChange={(event) =>
                    updateDraftField({
                      expiryMonth: event.target.value.replace(/\D/g, '').slice(0, 2),
                    })
                  }
                  placeholder="08"
                  type="text"
                  value={draft.expiryMonth}
                />
              </label>

              <label className="field">
                <span>Ano</span>
                <input
                  inputMode="numeric"
                  maxLength={2}
                  onChange={(event) =>
                    updateDraftField({
                      expiryYear: event.target.value.replace(/\D/g, '').slice(0, 2),
                    })
                  }
                  placeholder="29"
                  type="text"
                  value={draft.expiryYear}
                />
              </label>

              <label className="field">
                <span>CVC</span>
                <input
                  inputMode="numeric"
                  maxLength={4}
                  onChange={(event) =>
                    updateDraftField({
                      cvc: event.target.value.replace(/\D/g, '').slice(0, 4),
                    })
                  }
                  placeholder="123"
                  type="password"
                  value={draft.cvc}
                />
              </label>
            </div>
          </section>

          <section className="modal-section">
            <div className="section-heading compact">
              <p className="eyebrow">Entrega</p>
              <h3>Datos del cliente</h3>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Nombre completo</span>
                <input
                  onChange={(event) =>
                    updateDraftField({ customerName: event.target.value })
                  }
                  placeholder="Andres Pineda"
                  type="text"
                  value={draft.customerName}
                />
              </label>

              <label className="field">
                <span>Correo</span>
                <input
                  onChange={(event) =>
                    updateDraftField({ customerEmail: event.target.value })
                  }
                  placeholder="correo@ejemplo.com"
                  type="email"
                  value={draft.customerEmail}
                />
              </label>

              <label className="field">
                <span>Telefono</span>
                <input
                  inputMode="tel"
                  onChange={(event) =>
                    updateDraftField({
                      customerPhone: event.target.value.replace(/[^\d+ ]/g, ''),
                    })
                  }
                  placeholder="3001234567"
                  type="tel"
                  value={draft.customerPhone}
                />
              </label>

              <label className="field field-wide">
                <span>Direccion</span>
                <input
                  onChange={(event) =>
                    updateDraftField({ addressLine: event.target.value })
                  }
                  placeholder="Cra 10 # 24 - 18"
                  type="text"
                  value={draft.addressLine}
                />
              </label>

              <label className="field">
                <span>Ciudad</span>
                <input
                  onChange={(event) => updateDraftField({ city: event.target.value })}
                  placeholder="Barranquilla"
                  type="text"
                  value={draft.city}
                />
              </label>

              <label className="field">
                <span>Departamento</span>
                <input
                  onChange={(event) =>
                    updateDraftField({ department: event.target.value })
                  }
                  placeholder="Atlantico"
                  type="text"
                  value={draft.department}
                />
              </label>
            </div>
          </section>
        </div>

        {showErrors && validationError ? (
          <p className="form-error">{validationError}</p>
        ) : null}

        <section className="consent-panel">
          <div className="section-heading compact">
            <p className="eyebrow">Consentimiento</p>
            <h3>Autorizaciones exigidas por Wompi</h3>
          </div>

          <label className="consent-check">
            <input
              checked={draft.acceptedTerms}
              onChange={(event) =>
                updateDraftField({ acceptedTerms: event.target.checked })
              }
              type="checkbox"
            />
            <span>
              Acepto los{' '}
              {acceptanceInfo?.acceptancePermalink ? (
                <a
                  href={acceptanceInfo.acceptancePermalink}
                  rel="noreferrer"
                  target="_blank"
                >
                  terminos y condiciones
                </a>
              ) : (
                'terminos y condiciones'
              )}{' '}
              del procesamiento del pago.
            </span>
          </label>

          {acceptanceInfo?.acceptPersonalAuthToken ? (
            <label className="consent-check">
              <input
                checked={draft.acceptedPersonalDataAuth}
                onChange={(event) =>
                  updateDraftField({
                    acceptedPersonalDataAuth: event.target.checked,
                  })
                }
                type="checkbox"
              />
              <span>
                Autorizo el{' '}
                {acceptanceInfo.acceptPersonalAuthPermalink ? (
                  <a
                    href={acceptanceInfo.acceptPersonalAuthPermalink}
                    rel="noreferrer"
                    target="_blank"
                  >
                    tratamiento de datos personales
                  </a>
                ) : (
                  'tratamiento de datos personales'
                )}
                .
              </span>
            </label>
          ) : null}

          {acceptanceError ? <p className="form-hint">{acceptanceError}</p> : null}
        </section>

        <p className="form-hint">
          Demo sandbox: usa <strong>4242 4242 4242 4242</strong> para aprobado o{' '}
          <strong>4111 1111 1111 1111</strong> para rechazo.
        </p>

        <div className="overlay-actions">
          <button className="ghost-button" onClick={onClose} type="button">
            Volver al catalogo
          </button>
          <button className="primary-button" onClick={handleContinue} type="button">
            Continuar al resumen
          </button>
        </div>
      </section>
    </div>
  )
}
