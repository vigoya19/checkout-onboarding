import { httpGet, httpPost } from '@/shared/api/http-client'

export type CheckoutTransaction = {
  transactionId: string
  reference: string
  productId: string
  customerEmail: string
  amountInCents: number
  baseFeeInCents: number
  deliveryFeeInCents: number
  paymentStatus: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR'
  fulfillmentStatus: 'NOT_STARTED' | 'COMPLETED' | 'FAILED'
  createdAt: string
  wompiTransactionId: string | null
  paymentMethodType: string | null
  paymentStatusMessage: string | null
  cardBrand: string | null
  cardLastFour: string | null
}

export async function createTransaction(input: {
  productId: string
  customerEmail: string
  customerName: string
  customerPhone: string
  addressLine1: string
  city: string
  department: string
  amountInCents: number
  baseFeeInCents: number
  deliveryFeeInCents: number
  currency: 'COP'
}) {
  return httpPost<CheckoutTransaction, typeof input>('/transactions', input)
}

export async function payTransaction(
  transactionId: string,
  input: {
    cardToken: string
    acceptanceToken: string
    acceptPersonalAuthToken?: string
    installments: number
  },
) {
  return httpPost<CheckoutTransaction, typeof input>(
    `/transactions/${transactionId}/pay`,
    input,
  )
}

export async function getTransaction(transactionId: string) {
  return httpGet<CheckoutTransaction>(`/transactions/${transactionId}`)
}
