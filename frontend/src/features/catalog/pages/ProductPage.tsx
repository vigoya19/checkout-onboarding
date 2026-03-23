import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { ProductHero } from '@/features/catalog/components/ProductHero'
import {
  fetchProducts,
  selectCatalogErrorMessage,
  selectCatalogProducts,
  selectCatalogStatus,
  selectProduct,
  selectSelectedProduct,
} from '@/features/catalog/catalog.slice'
import {
  returnToCatalog,
  selectCheckoutDraft,
  selectCheckoutResult,
  selectCheckoutStatusMessage,
  selectCheckoutStep,
  selectCheckoutTransactionReference,
  startCheckout,
} from '@/features/checkout/checkout.slice'
import { CheckoutModal } from '@/features/checkout/components/CheckoutModal'
import { FinalStatusPanel } from '@/features/checkout/components/FinalStatusPanel'
import { SummaryBackdrop } from '@/features/checkout/components/SummaryBackdrop'
import { formatCurrency } from '@/shared/lib/currency'

const steps = [
  'Producto',
  'Tarjeta y entrega',
  'Resumen',
  'Estado final',
] as const

export function ProductPage() {
  const dispatch = useAppDispatch()
  const product = useAppSelector(selectSelectedProduct)
  const products = useAppSelector(selectCatalogProducts)
  const status = useAppSelector(selectCatalogStatus)
  const errorMessage = useAppSelector(selectCatalogErrorMessage)
  const checkoutStep = useAppSelector(selectCheckoutStep)
  const checkoutDraft = useAppSelector(selectCheckoutDraft)
  const checkoutResult = useAppSelector(selectCheckoutResult)
  const checkoutStatusMessage = useAppSelector(selectCheckoutStatusMessage)
  const checkoutTransactionReference = useAppSelector(
    selectCheckoutTransactionReference,
  )

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchProducts())
    }
  }, [dispatch, status])

  const handleBuyProduct = (productId: string) => {
    dispatch(selectProduct(productId))
    dispatch(startCheckout())
  }

  const handleReturnToCatalog = () => {
    dispatch(returnToCatalog())
    void dispatch(fetchProducts())
  }

  return (
    <main className="page">
      <ProductHero product={product} />

      <section className="shell grid-layout">
        <article className="card flow-card">
          <div className="section-heading">
            <p className="eyebrow">Catalogo</p>
            <h2>Escoge una consola y arranca el checkout</h2>
            <p className="section-copy">
              Elige un producto, presiona comprar y pasa directo al flujo de pago
              con tarjeta y entrega.
            </p>
          </div>

          <div className="status-panel">
            <span className="label">Catalogo</span>
            <strong>
              {status === 'loading'
                ? 'Cargando productos desde la API'
                : status === 'failed'
                  ? 'No se pudo cargar el catalogo'
                  : products.length > 0
                    ? 'Catalogo cargado desde backend'
                    : 'No hay productos disponibles'}
            </strong>
            {errorMessage ? <p>{errorMessage}</p> : null}
          </div>

          {products.length > 0 ? (
            <div className="product-list">
              {products.map((catalogProduct) => {
                const isSelected = catalogProduct.id === product?.id

                return (
                  <article
                    key={catalogProduct.id}
                    className={isSelected ? 'product-card selected' : 'product-card'}
                  >
                    <div className="product-card-accent" />
                    <div className="product-card-copy">
                      <div className="product-card-header">
                        <div>
                          <p className="product-card-kicker">Consola disponible</p>
                          <h3>{catalogProduct.name}</h3>
                        </div>
                        <span className="stock-pill">
                          {catalogProduct.stock} en stock
                        </span>
                      </div>

                      <p>{catalogProduct.description}</p>
                    </div>

                    <div className="product-card-footer">
                      <div>
                        <span className="label">Precio</span>
                        <strong>
                          {formatCurrency(
                            catalogProduct.priceInCents,
                            catalogProduct.currency,
                          )}
                        </strong>
                      </div>

                      <button
                        className={isSelected ? 'ghost-button' : 'primary-button'}
                        onClick={() => handleBuyProduct(catalogProduct.id)}
                        type="button"
                      >
                        {isSelected ? 'Seleccionada' : 'Comprar'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="status-panel">
              <span className="label">Catalogo</span>
              <strong>No hay productos para iniciar el checkout</strong>
              <p>Si el backend esta arriba, vuelve a recargar la pantalla.</p>
            </div>
          )}

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

          <div className="flow-actions">
            <button
              className="ghost-button"
              onClick={() => dispatch(returnToCatalog())}
              type="button"
            >
              Volver al paso 1
            </button>
            <button
              className="primary-button"
              disabled={!product}
              onClick={() => dispatch(startCheckout())}
              type="button"
            >
              {product ? `Comprar ${product.name}` : 'Checkout no disponible'}
            </button>
          </div>
        </article>

        <aside className="card summary-card">
          <div className="section-heading">
            <p className="eyebrow">Flujo activo</p>
            <h2>Resumen del checkout</h2>
            <p className="section-copy">
              Esta columna deja claro en qué parte del onboarding va el cliente.
            </p>
          </div>

          <dl className="summary-list">
            <div>
              <dt>Paso actual</dt>
              <dd>{checkoutStep} de 4</dd>
            </div>
            <div>
              <dt>Total producto</dt>
              <dd>
                {product
                  ? formatCurrency(product.priceInCents, product.currency)
                  : 'Sin producto'}
              </dd>
            </div>
            <div>
              <dt>Fee base</dt>
              <dd>
                {formatCurrency(
                  checkoutDraft.baseFeeInCents,
                  product?.currency ?? 'COP',
                )}
              </dd>
            </div>
            <div>
              <dt>Delivery fee</dt>
              <dd>
                {formatCurrency(
                  checkoutDraft.deliveryFeeInCents,
                  product?.currency ?? 'COP',
                )}
              </dd>
            </div>
          </dl>

          <div className="status-panel">
            <span className="label">Siguiente paso</span>
            <strong>
              {product && checkoutStep >= 2
                ? 'Abrir modal de pago y datos de entrega'
                : 'Selecciona una consola para iniciar el flujo'}
            </strong>
          </div>
        </aside>
      </section>

      {checkoutStep === 2 && product ? (
        <CheckoutModal
          draft={checkoutDraft}
          onClose={handleReturnToCatalog}
        />
      ) : null}

      {checkoutStep === 3 && product ? (
        <SummaryBackdrop draft={checkoutDraft} product={product} />
      ) : null}

      {checkoutStep === 4 && checkoutResult ? (
        <FinalStatusPanel
          result={checkoutResult}
          statusMessage={checkoutStatusMessage}
          transactionReference={checkoutTransactionReference}
          onReturn={handleReturnToCatalog}
        />
      ) : null}
    </main>
  )
}
