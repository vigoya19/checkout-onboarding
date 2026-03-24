jest.mock('@/shared/api/http-client', () => ({
  httpPost: jest.fn(),
}))

import { httpPost } from '@/shared/api/http-client'
import { askAssistant } from '@/features/assistant/assistant.api'

describe('assistant.api', () => {
  it('sends the question payload to the backend assistant endpoint', async () => {
    ;(httpPost as jest.Mock).mockResolvedValue({ answer: 'ok' })

    await expect(
      askAssistant({
        message: '¿Que incluye el pago?',
        productId: 'prod_ps5',
      }),
    ).resolves.toEqual({ answer: 'ok' })

    expect(httpPost).toHaveBeenCalledWith('/assistant', {
      message: '¿Que incluye el pago?',
      productId: 'prod_ps5',
    })
  })
})
