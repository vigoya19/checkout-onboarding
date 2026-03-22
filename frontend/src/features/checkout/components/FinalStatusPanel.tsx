import type { CheckoutResult } from '@/features/checkout/checkout.slice'

type FinalStatusPanelProps = {
  result: Exclude<CheckoutResult, null>
  statusMessage: string
  transactionReference: string | null
  onReturn: () => void
}

export function FinalStatusPanel({
  result,
  statusMessage,
  transactionReference,
  onReturn,
}: FinalStatusPanelProps) {
  const isSuccess = result === 'success'
  const isPending = result === 'pending'

  return (
    <div className="overlay-shell" role="presentation">
      <div className="overlay-backdrop" />

      <section className="overlay-panel status-result-panel" role="dialog" aria-modal="true">
        <div
          className={
            isSuccess
              ? 'result-badge success'
              : isPending
                ? 'result-badge pending'
                : 'result-badge failure'
          }
        >
          {isSuccess
            ? 'Pago exitoso'
            : isPending
              ? 'Pago pendiente'
              : 'Pago rechazado'}
        </div>

        <h2>
          {isSuccess
            ? 'La compra fue aprobada'
            : isPending
              ? 'La transaccion sigue en proceso'
              : 'No pudimos aprobar el pago'}
        </h2>
        <p className="section-copy">{statusMessage}</p>

        {transactionReference ? (
          <div className="status-reference">
            <span className="label">Referencia</span>
            <strong>{transactionReference}</strong>
          </div>
        ) : null}

        <div className="overlay-actions">
          <button
            className="primary-button"
            onClick={onReturn}
            type="button"
          >
            Volver al catalogo
          </button>
        </div>
      </section>
    </div>
  )
}
