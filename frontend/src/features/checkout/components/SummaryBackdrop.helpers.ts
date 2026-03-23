import type { CheckoutTransaction } from '@/features/transactions/transactions.api'
import { getTransaction } from '@/features/transactions/transactions.api'

export function buildStatusMessage(transaction: CheckoutTransaction) {
  if (transaction.fulfillmentStatus === 'FAILED') {
    return 'El pago fue aprobado, pero no pudimos reservar stock o crear la entrega.'
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

export async function waitForFinalTransactionState(transactionId: string) {
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
