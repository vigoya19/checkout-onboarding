import { fireEvent, render, screen } from '@testing-library/react'
import { FinalStatusPanel } from '@/features/checkout/components/FinalStatusPanel'

describe('FinalStatusPanel', () => {
  it('renders success information and returns to catalog', () => {
    const onReturn = jest.fn()

    render(
      <FinalStatusPanel
        result="success"
        statusMessage="Aprobado por Wompi"
        transactionReference="tx-1"
        onReturn={onReturn}
      />,
    )

    expect(screen.getByText('La compra fue aprobada')).toBeInTheDocument()
    expect(screen.getByText('tx-1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Volver al catalogo' }))
    expect(onReturn).toHaveBeenCalled()
  })

  it('renders the pending state', () => {
    render(
      <FinalStatusPanel
        result="pending"
        statusMessage="Pendiente"
        transactionReference={null}
        onReturn={jest.fn()}
      />,
    )

    expect(screen.getByText('La transaccion sigue en proceso')).toBeInTheDocument()
  })

  it('renders the failure state', () => {
    render(
      <FinalStatusPanel
        result="failure"
        statusMessage="Rechazada"
        transactionReference="tx-2"
        onReturn={jest.fn()}
      />,
    )

    expect(screen.getByText('No pudimos aprobar el pago')).toBeInTheDocument()
  })
})
