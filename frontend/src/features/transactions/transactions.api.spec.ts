jest.mock('@/shared/api/http-client', () => ({
  httpGet: jest.fn(),
  httpPost: jest.fn(),
}))

import { httpGet, httpPost } from '@/shared/api/http-client'
import {
  createTransaction,
  getTransaction,
  payTransaction,
} from '@/features/transactions/transactions.api'

describe('transactions.api', () => {
  it('creates local transactions', async () => {
    ;(httpPost as jest.Mock).mockResolvedValue({ ok: true })

    await createTransaction({
      productId: 'prod_ps5',
      customerEmail: 'andres@example.com',
      customerName: 'Andres',
      customerPhone: '3001234567',
      addressLine1: 'Cra 1 # 2 - 3',
      city: 'Barranquilla',
      department: 'Atlantico',
      amountInCents: 1000,
      baseFeeInCents: 100,
      deliveryFeeInCents: 200,
      currency: 'COP',
    })

    expect(httpPost).toHaveBeenCalledWith('/transactions', expect.any(Object))
  })

  it('pays existing transactions', async () => {
    ;(httpPost as jest.Mock).mockResolvedValue({ ok: true })

    await payTransaction('tx-1', {
      cardToken: 'tok_1',
      acceptanceToken: 'acc_1',
      installments: 1,
    })

    expect(httpPost).toHaveBeenCalledWith(
      '/transactions/tx-1/pay',
      expect.objectContaining({
        cardToken: 'tok_1',
      }),
    )
  })

  it('reads transaction status', async () => {
    ;(httpGet as jest.Mock).mockResolvedValue({ transactionId: 'tx-1' })

    await expect(getTransaction('tx-1')).resolves.toEqual({
      transactionId: 'tx-1',
    })
    expect(httpGet).toHaveBeenCalledWith('/transactions/tx-1')
  })
})
