jest.mock('@/features/assistant/assistant.api', () => ({
  askAssistant: jest.fn(),
}))

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { askAssistant } from '@/features/assistant/assistant.api'
import { AssistantPanel } from '@/features/assistant/components/AssistantPanel'

describe('AssistantPanel', () => {
  const product = {
    id: 'prod_ps5',
    name: 'PlayStation 5',
    description: 'Consola PS5',
    features: ['1 TB SSD', '4K'],
    priceInCents: 299900000,
    currency: 'COP' as const,
    stock: 5,
  }

  it('asks the backend assistant with the current context', async () => {
    ;(askAssistant as jest.Mock).mockResolvedValue({ answer: 'Te ayuda con el total.' })

    render(
      <AssistantPanel
        product={product}
        currentStep={1}
        baseFeeInCents={390000}
        deliveryFeeInCents={990000}
      />,
    )

    fireEvent.change(screen.getByPlaceholderText(/Ejemplo:/i), {
      target: { value: '¿Que incluye el total?' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Preguntar al asistente' }))

    await waitFor(() =>
      expect(askAssistant).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '¿Que incluye el total?',
          productId: 'prod_ps5',
          baseFeeInCents: 390000,
          deliveryFeeInCents: 990000,
        }),
      ),
    )

    expect(screen.getByText('Te ayuda con el total.')).toBeInTheDocument()
  })

  it('uses suggested questions', async () => {
    ;(askAssistant as jest.Mock).mockResolvedValue({ answer: 'Incluye producto y costos.' })

    render(
      <AssistantPanel
        product={product}
        currentStep={1}
        baseFeeInCents={390000}
        deliveryFeeInCents={990000}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '¿Que incluye el total de la compra?' }))

    await waitFor(() =>
      expect(askAssistant).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '¿Que incluye el total de la compra?',
        }),
      ),
    )
  })
})
