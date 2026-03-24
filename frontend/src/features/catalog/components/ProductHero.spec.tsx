import { render, screen } from '@testing-library/react'
import { ProductHero } from '@/features/catalog/components/ProductHero'

describe('ProductHero', () => {
  it('renders an empty state when no product exists', () => {
    render(<ProductHero product={null} />)

    expect(screen.getByText('Sin productos disponibles')).toBeInTheDocument()
  })

  it('renders the selected product', () => {
    render(
      <ProductHero
        product={{
          id: 'prod_ps5',
          name: 'PlayStation 5',
          description: 'desc',
          features: ['1 TB SSD', 'Soporte para 4K'],
          priceInCents: 299900000,
          currency: 'COP',
          stock: 5,
        }}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'PlayStation 5', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByText(/5 unidades/i)).toBeInTheDocument()
    expect(screen.getByText('1 TB SSD')).toBeInTheDocument()
  })
})
