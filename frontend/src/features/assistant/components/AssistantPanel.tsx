import { useState } from 'react'
import { askAssistant } from '@/features/assistant/assistant.api'
import { formatCurrency } from '@/shared/lib/currency'
import type { Product } from '@/shared/types/product'

type AssistantPanelProps = {
  product: Product | null
  currentStep: number
  baseFeeInCents: number
  deliveryFeeInCents: number
}

const suggestedQuestions = [
  '¿Que incluye el total de la compra?',
  '¿Que debo hacer para pagar?',
  '¿Que caracteristicas tiene este producto?',
] as const

export function AssistantPanel({
  product,
  currentStep,
  baseFeeInCents,
  deliveryFeeInCents,
}: AssistantPanelProps) {
  const [message, setMessage] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAsk = async (question: string) => {
    const trimmedQuestion = question.trim()

    if (!trimmedQuestion) {
      return
    }

    setIsLoading(true)
    setAnswer('')
    setError('')

    try {
      const response = await askAssistant({
        message: trimmedQuestion,
        productId: product?.id,
        currentStep,
        baseFeeInCents,
        deliveryFeeInCents,
      })

      setAnswer(response.answer)
      setMessage('')
    } catch (assistantError) {
      setError(
        assistantError instanceof Error
          ? assistantError.message
          : 'No fue posible consultar el asistente en este momento.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="card assistant-card">
      <div className="section-heading compact">
        <p className="eyebrow">Asistente IA</p>
        <h2>Ayuda para continuar la compra</h2>
        <p className="section-copy">
          Puedes preguntar por el producto, el total, los costos o el siguiente
          paso del pago.
        </p>
      </div>

      <div className="assistant-context">
        <div>
          <span className="label">Producto actual</span>
          <strong>{product?.name ?? 'Aun no has seleccionado un producto'}</strong>
        </div>
        <div>
          <span className="label">Total estimado</span>
          <strong>
            {product
              ? formatCurrency(
                  product.priceInCents + baseFeeInCents + deliveryFeeInCents,
                  product.currency,
                )
              : 'Pendiente'}
          </strong>
        </div>
      </div>

      <div className="assistant-suggestions">
        {suggestedQuestions.map((question) => (
          <button
            key={question}
            className="assistant-chip"
            disabled={isLoading}
            onClick={() => {
              void handleAsk(question)
            }}
            type="button"
          >
            {question}
          </button>
        ))}
      </div>

      <label className="assistant-form">
        <span className="label">Tu pregunta</span>
        <textarea
          className="assistant-textarea"
          disabled={isLoading}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ejemplo: ¿Por que estoy viendo fee base y delivery fee?"
          rows={4}
          value={message}
        />
      </label>

      <div className="assistant-actions">
        <button
          className="primary-button"
          disabled={isLoading || message.trim().length === 0}
          onClick={() => {
            void handleAsk(message)
          }}
          type="button"
        >
          {isLoading ? 'Consultando al asistente...' : 'Preguntar al asistente'}
        </button>
      </div>

      {isLoading ? (
        <div className="assistant-response">
          <span className="label">Estado</span>
          <p>El asistente esta preparando una respuesta breve para ayudarte.</p>
        </div>
      ) : null}

      {answer ? (
        <div className="assistant-response">
          <span className="label">Respuesta</span>
          <p>{answer}</p>
        </div>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}
    </section>
  )
}
