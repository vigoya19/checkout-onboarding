import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { formatCurrency } from '@/shared/lib/currency'
import type { Product } from '@/shared/types/product'
import {
  backToPayment,
  completeCheckout,
  failPaymentSubmission,
  selectIsSubmittingPayment,
  selectPaymentError,
  startPaymentSubmission,
  type CheckoutState,
} from '@/features/checkout/checkout.slice'
import { getAcceptanceTokens, tokenizeCard } from '@/features/payments/payments.api'
import {
  createTransaction,
  getTransaction,
  payTransaction,
  type CheckoutTransaction,
} from '@/features/transactions/transactions.api'

type SummaryBackdropProps = {
  draft: CheckoutState['draft']
  product: Product
}

function buildStatusMessage(transaction: CheckoutTransaction) {
  if (transaction.fulfillmentStatus === 'FAILED') {
    return 'El pago fue aprobado, pero no pudimos reservar stock o crear la entrega.';
  }

  if (transaction.paymentStatus === 'PENDING') {
    return (
      transaction.paymentStatusMessage ??
      'La transaccion sigue pendiente en Wompi. Puedes volver al catalogo y consultar el estado mas tarde.'
    )
  }

  return (
    transaction.paymentStatusMessage ??
    (transaction.paymentStatus === 'APPROVED'
      ? 'Wompi aprobo la transaccion.'
      : 'Wompi no aprobo la transaccion.')
  )
}

async function waitForFinalTransactionState(transactionId: string) {
  let latestTransaction = await getTransaction(transactionId)

  if (latestTransaction.paymentStatus !== 'PENDING') {
    return latestTransaction
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 1200)
    })

    latestTransaction = await getTransaction(transactionId)

    if (latestTransaction.paymentStatus !== 'PENDING') {
      return latestTransaction
    }
  }

  return latestTransaction
}

export function SummaryBackdrop({ draft, product }: SummaryBackdropProps) {
  const dispatch = useAppDispatch()
  const isSubmittingPayment = useAppSelector(selectIsSubmittingPayment)
  const paymentError = useAppSelector(selectPaymentError)
  const total =
    product.priceInCents + draft.baseFeeInCents + draft.deliveryFeeInCents

  const handlePay = async () => {
    dispatch(startPaymentSubmission())

    try {
      const acceptanceTokens = await getAcceptanceTokens()
      const cardToken = await tokenizeCard({
        number: draft.cardNumber,
        expMonth: draft.expiryMonth,
        expYear: draft.expiryYear,
        cvc: draft.cvc,
        cardHolder: draft.cardHolder,
      })
      const localTransaction = await createTransaction({
        productId: product.id,
        customerEmail: draft.customerEmail,
        customerName: draft.customerName,
        customerPhone: draft.customerPhone,
        addressLine1: draft.addressLine,
        city: draft.city,
        department: draft.department,
        amountInCents: total,
        baseFeeInCents: draft.baseFeeInCents,
        deliveryFeeInCents: draft.deliveryFeeInCents,
        currency: product.currency,
      })
      const paymentTransaction = await payTransaction(
        localTransaction.transactionId,
        {
          cardToken: cardToken.tokenId,
          acceptanceToken: acceptanceTokens.acceptanceToken,
          acceptPersonalAuthToken:
            acceptanceTokens.acceptPersonalAuthToken ?? undefined,
          installments: 1,
        },
      )
      const finalTransaction =
        paymentTransaction.paymentStatus === 'PENDING'
          ? await waitForFinalTransactionState(localTransaction.transactionId)
          : paymentTransaction

      dispatch(
        completeCheckout({
          result:
            finalTransaction.paymentStatus === 'APPROVED' &&
            finalTransaction.fulfillmentStatus !== 'FAILED'
              ? 'success'
              : finalTransaction.paymentStatus === 'PENDING'
                ? 'pending'
                : 'failure',
          statusMessage: buildStatusMessage(finalTransaction),
          transactionReference: finalTransaction.reference,
        }),
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No fue posible procesar el pago con Wompi.'

      dispatch(failPaymentSubmission(message))
    }
  }

  return (
    <div className="overlay-shell" role="presentation">
      <div className="overlay-backdrop overlay-backdrop-dark" />

      <section className="overlay-panel summary-panel" role="dialog" aria-modal="true">
        <div className="section-heading compact">
          <p className="eyebrow">Paso 3</p>
          <h2>Resumen de pago</h2>
          <p className="section-copy">
            Backdrop de confirmacion antes de enviar la transaccion.
          </p>
        </div>

        <div className="summary-highlight">
          <span className="label">Producto</span>
          <strong>{product.name}</strong>
          <p>{draft.customerName}</p>
        </div>

        <dl className="summary-list large">
          <div>
            <dt>Producto</dt>
            <dd>{formatCurrency(product.priceInCents, product.currency)}</dd>
          </div>
          <div>
            <dt>Base fee</dt>
            <dd>{formatCurrency(draft.baseFeeInCents, product.currency)}</dd>
          </div>
          <div>
            <dt>Delivery fee</dt>
            <dd>{formatCurrency(draft.deliveryFeeInCents, product.currency)}</dd>
          </div>
          <div className="summary-total">
            <dt>Total a pagar</dt>
            <dd>{formatCurrency(total, product.currency)}</dd>
          </div>
        </dl>

        <div className="summary-customer">
          <div>
            <span className="label">Entrega</span>
            <strong>
              {draft.addressLine}, {draft.city}
            </strong>
          </div>
          <div>
            <span className="label">Metodo</span>
            <strong>{draft.cardBrand || 'Tarjeta'} terminada en {draft.cardNumber.slice(-4)}</strong>
          </div>
        </div>

        {paymentError ? <p className="form-error">{paymentError}</p> : null}

        <div className="overlay-actions">
          <button
            className="ghost-button"
            onClick={() => dispatch(backToPayment())}
            type="button"
          >
            Editar informacion
          </button>
          <button
            className="primary-button"
            onClick={handlePay}
            disabled={isSubmittingPayment}
            type="button"
          >
            {isSubmittingPayment ? 'Procesando pago...' : 'Pagar con tarjeta'}
          </button>
        </div>
      </section>
    </div>
  )
}
