jest.mock('@/features/transactions/transactions.api', () => ({
  getTransaction: jest.fn(),
}))

import {
  buildStatusMessage,
  waitForFinalTransactionState,
} from '@/features/checkout/components/SummaryBackdrop.helpers'
import { getTransaction } from '@/features/transactions/transactions.api'

describe('SummaryBackdrop helpers', () => {
  const baseTransaction = {
    transactionId: 'tx-1',
    reference: 'tx-1',
    productId: 'prod_ps5',
    customerEmail: 'andres@example.com',
    amountInCents: 1000,
    baseFeeInCents: 100,
    deliveryFeeInCents: 200,
    paymentStatus: 'APPROVED' as const,
    fulfillmentStatus: 'COMPLETED' as const,
    createdAt: '2026-03-22',
    wompiTransactionId: 'wompi-1',
    paymentMethodType: 'CARD',
    paymentStatusMessage: null,
    cardBrand: 'VISA',
    cardLastFour: '4242',
  }

  it('builds status messages for the main payment branches', () => {
    expect(
      buildStatusMessage({
        ...baseTransaction,
        fulfillmentStatus: 'FAILED',
      }),
    ).toContain('no pudimos reservar stock')

    expect(
      buildStatusMessage({
        ...baseTransaction,
        paymentStatus: 'PENDING',
        fulfillmentStatus: 'NOT_STARTED',
      }),
    ).toContain('transaccion sigue pendiente')

    expect(
      buildStatusMessage({
        ...baseTransaction,
        paymentStatus: 'DECLINED',
      }),
    ).toContain('no aprobo la transaccion')
  })

  it('waits until the transaction leaves PENDING', async () => {
    jest.useFakeTimers()
    ;(getTransaction as jest.Mock)
      .mockResolvedValueOnce({
        ...baseTransaction,
        paymentStatus: 'PENDING',
        fulfillmentStatus: 'NOT_STARTED',
      })
      .mockResolvedValueOnce(baseTransaction)

    const promise = waitForFinalTransactionState('tx-1')
    await jest.advanceTimersByTimeAsync(1200)

    await expect(promise).resolves.toEqual(baseTransaction)
    jest.useRealTimers()
  })

  it('returns immediately when the first lookup is already final', async () => {
    ;(getTransaction as jest.Mock).mockResolvedValue(baseTransaction)

    await expect(waitForFinalTransactionState('tx-1')).resolves.toEqual(
      baseTransaction,
    )
  })

  it('returns the latest transaction when Wompi stays pending', async () => {
    jest.useFakeTimers()
    const pendingTransaction = {
      ...baseTransaction,
      paymentStatus: 'PENDING' as const,
      fulfillmentStatus: 'NOT_STARTED' as const,
    }

    ;(getTransaction as jest.Mock).mockResolvedValue(pendingTransaction)

    const promise = waitForFinalTransactionState('tx-1')
    await jest.advanceTimersByTimeAsync(4 * 1200)

    await expect(promise).resolves.toEqual(pendingTransaction)
    jest.useRealTimers()
  })
})
