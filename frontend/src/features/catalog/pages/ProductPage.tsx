import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { AssistantPanel } from '@/features/assistant/components/AssistantPanel'
import { ProductHero } from '@/features/catalog/components/ProductHero'
import { ProductImage } from '@/features/catalog/components/ProductImage'
import {
  fetchProducts,
  selectCatalogErrorMessage,
  selectCatalogProducts,
  selectCatalogStatus,
  selectProduct,
  selectSelectedProduct,
} from '@/features/catalog/catalog.slice'
import {
  fetchCheckoutConfig,
  selectCheckoutConfigError,
  selectCheckoutConfigStatus,
  returnToCatalog,
  selectCheckoutDraft,
  selectCheckoutPricing,
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

function getCatalogStatusTitle(
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  productsCount: number,
) {
  if (status === 'loading') {
    return 'Cargando productos desde la API'
  }

  if (status === 'failed') {
    return 'No se pudo cargar el catalogo'
  }

  return productsCount > 0
    ? 'Catalogo cargado desde backend'
    : 'No hay productos disponibles'
}

function getPaymentStatusTitle(
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
) {
  if (status === 'loading') {
    return 'Estamos preparando los costos de la compra'
  }

  if (status === 'failed') {
    return 'No se pudieron cargar los costos de la compra'
  }

  return 'Preparando la informacion de pago'
}

function getBuyButtonLabel(
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
) {
  if (status === 'loading') {
    return 'Preparando compra...'
  }

  return 'Comprar'
}

export function ProductPage() {
  const dispatch = useAppDispatch()
  const pendingCheckoutProductIdRef = useRef<string | null>(null)
  const product = useAppSelector(selectSelectedProduct)
  const products = useAppSelector(selectCatalogProducts)
  const status = useAppSelector(selectCatalogStatus)
  const errorMessage = useAppSelector(selectCatalogErrorMessage)
  const checkoutStep = useAppSelector(selectCheckoutStep)
  const checkoutDraft = useAppSelector(selectCheckoutDraft)
  const checkoutPricing = useAppSelector(selectCheckoutPricing)
  const checkoutConfigStatus = useAppSelector(selectCheckoutConfigStatus)
  const checkoutConfigError = useAppSelector(selectCheckoutConfigError)
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

  useEffect(() => {
    if (checkoutConfigStatus === 'idle') {
      void dispatch(fetchCheckoutConfig())
    }
  }, [checkoutConfigStatus, dispatch])

  useEffect(() => {
    const pendingCheckoutProductId = pendingCheckoutProductIdRef.current

    if (!pendingCheckoutProductId || checkoutConfigStatus !== 'succeeded') {
      return
    }

    dispatch(selectProduct(pendingCheckoutProductId))
    dispatch(startCheckout())
    pendingCheckoutProductIdRef.current = null
  }, [checkoutConfigStatus, dispatch])

  const handleBuyProduct = (productId: string) => {
    if (checkoutConfigStatus !== 'succeeded') {
      pendingCheckoutProductIdRef.current = productId
      dispatch(selectProduct(productId))
      void dispatch(fetchCheckoutConfig())
      return
    }

    pendingCheckoutProductIdRef.current = null
    dispatch(selectProduct(productId))
    dispatch(startCheckout())
  }

  const handleViewProduct = (productId: string) => {
    dispatch(selectProduct(productId))
  }

  const handleReturnToCatalog = () => {
    pendingCheckoutProductIdRef.current = null
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
            <h2>Explora el catalogo y compra cuando quieras</h2>
            <p className="section-copy">
              Puedes ver el detalle de cualquier producto y, cuando estes listo,
              continuar con el pago con tarjeta y los datos de entrega.
            </p>
          </div>

          <div className="status-panel">
            <span className="label">Catalogo</span>
            <strong>{getCatalogStatusTitle(status, products.length)}</strong>
            {errorMessage ? <p>{errorMessage}</p> : null}
          </div>

          {checkoutConfigStatus !== 'succeeded' ? (
            <div className="status-panel">
              <span className="label">Pago</span>
              <strong>{getPaymentStatusTitle(checkoutConfigStatus)}</strong>
              {checkoutConfigError ? <p>{checkoutConfigError}</p> : null}
            </div>
          ) : null}

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
                    <div className="product-card-image-shell">
                      <ProductImage
                        className="product-card-image"
                        key={catalogProduct.name}
                        productName={catalogProduct.name}
                      />
                    </div>
                    <div className="product-card-copy">
                      <div className="product-card-header">
                        <div>
                          <p className="product-card-kicker">Producto disponible</p>
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

                      <div className="product-card-actions">
                        <button
                          className="ghost-button"
                          onClick={() => handleViewProduct(catalogProduct.id)}
                          type="button"
                        >
                          {isSelected ? 'Viendo' : 'Ver'}
                        </button>

                        <button
                          className="primary-button"
                          onClick={() => handleBuyProduct(catalogProduct.id)}
                          type="button"
                        >
                          {getBuyButtonLabel(checkoutConfigStatus)}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="status-panel">
              <span className="label">Catalogo</span>
              <strong>No hay productos disponibles para comprar</strong>
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
              className="primary-button"
              disabled={!product}
              onClick={() => {
                if (!product) {
                  return
                }

                void handleBuyProduct(product.id)
              }}
              type="button"
            >
              {!product
                ? 'Compra no disponible'
                : getBuyButtonLabel(checkoutConfigStatus) ===
                    'Preparando compra...'
                  ? 'Preparando compra...'
                  : `Comprar ${product.name}`}
            </button>
          </div>
        </article>

        <aside className="summary-column">
          <section className="card summary-card">
            <div className="section-heading">
              <p className="eyebrow">Flujo activo</p>
              <h2>Resumen de la compra</h2>
              <p className="section-copy">
                Esta columna deja claro en qué parte del proceso de compra va el cliente.
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
                    checkoutPricing.baseFeeInCents,
                    product?.currency ?? 'COP',
                  )}
                </dd>
              </div>
              <div>
                <dt>Delivery fee</dt>
                <dd>
                  {formatCurrency(
                    checkoutPricing.deliveryFeeInCents,
                    product?.currency ?? 'COP',
                  )}
                </dd>
              </div>
            </dl>

            <div className="status-panel">
              <span className="label">Siguiente paso</span>
              <strong>
                {product && checkoutStep >= 2
                  ? 'Completar pago y datos de entrega'
                  : checkoutConfigStatus === 'succeeded'
                    ? 'Selecciona un producto para continuar'
                    : 'Preparando la compra'}
              </strong>
            </div>
          </section>

          <AssistantPanel
            product={product}
            currentStep={checkoutStep}
            baseFeeInCents={checkoutPricing.baseFeeInCents}
            deliveryFeeInCents={checkoutPricing.deliveryFeeInCents}
          />
        </aside>
      </section>

      {checkoutStep === 2 && product ? (
        <CheckoutModal
          draft={checkoutDraft}
          onClose={handleReturnToCatalog}
        />
      ) : null}

      {checkoutStep === 3 && product ? (
        <SummaryBackdrop
          draft={checkoutDraft}
          pricing={checkoutPricing}
          product={product}
        />
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
