import { httpPost } from '@/shared/api/http-client'

export type AssistantQuestion = {
  message: string
  productId?: string
  currentStep?: number
  baseFeeInCents?: number
  deliveryFeeInCents?: number
}

type AssistantResponse = {
  answer: string
}

export async function askAssistant(payload: AssistantQuestion) {
  return httpPost<AssistantResponse, AssistantQuestion>('/assistant', payload)
}
