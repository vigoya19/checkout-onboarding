import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { ProductHero } from '@/features/catalog/components/ProductHero'
import {
  advanceStep,
  selectCheckoutDraft,
  selectCheckoutStep,
} from '@/features/checkout/checkout.slice'
import { formatCurrency } from '@/shared/lib/currency'

const steps = [
  'Producto',
  'Tarjeta y entrega',
  'Resumen',
  'Estado final',
] as const

export function ProductPage() {
  const dispatch = useAppDispatch()
  const product = useAppSelector((state) => state.catalog.featuredProduct)
  const checkoutStep = useAppSelector(selectCheckoutStep)
  const checkoutDraft = useAppSelector(selectCheckoutDraft)

  return (
    <main className="page">
      <ProductHero product={product} />

      <section className="shell grid-layout">
        <article className="card flow-card">
          <div className="section-heading">
            <p className="eyebrow">Flujo inicial</p>
            <h2>Esqueleto del frontend</h2>
          </div>

          <ol className="step-list">
            {steps.map((label, index) => {
              const stepIndex = index + 1
              const isActive = checkoutStep === stepIndex

              return (
                <li key={label} className={isActive ? 'step active' : 'step'}>
                  <span>{stepIndex}</span>
                  <div>
                    <strong>{label}</strong>
                    <p>
                      {stepIndex === 1
                        ? 'Catalogo y stock.'
                        : stepIndex === 2
                          ? 'Formulario de pago y entrega.'
                          : stepIndex === 3
                            ? 'Resumen con fees.'
                            : 'Resultado del pago y retorno al catalogo.'}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>

          <button
            className="primary-button"
            onClick={() => dispatch(advanceStep())}
            type="button"
          >
            Avanzar en el flujo
          </button>
        </article>

        <aside className="card summary-card">
          <div className="section-heading">
            <p className="eyebrow">Estado de Redux</p>
            <h2>Resumen inicial</h2>
          </div>

          <dl className="summary-list">
            <div>
              <dt>Paso actual</dt>
              <dd>{checkoutStep} de 4</dd>
            </div>
            <div>
              <dt>Total producto</dt>
              <dd>{formatCurrency(product.priceInCents, product.currency)}</dd>
            </div>
            <div>
              <dt>Fee base</dt>
              <dd>{formatCurrency(checkoutDraft.baseFeeInCents, product.currency)}</dd>
            </div>
            <div>
              <dt>Delivery fee</dt>
              <dd>
                {formatCurrency(checkoutDraft.deliveryFeeInCents, product.currency)}
              </dd>
            </div>
          </dl>

          <div className="status-panel">
            <span className="label">Siguiente integracion</span>
            <strong>Conectar Redux con la API de Nest</strong>
          </div>
        </aside>
      </section>
    </main>
  )
}
