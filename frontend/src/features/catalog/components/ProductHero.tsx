import { formatCurrency } from '@/shared/lib/currency'
import type { Product } from '@/shared/types/product'

type ProductHeroProps = {
  product: Product
}

export function ProductHero({ product }: ProductHeroProps) {
  return (
    <section className="shell card hero-card">
      <div className="badge-row">
        <span className="badge badge-primary">Checkout onboarding</span>
        <span className="badge">Mobile first</span>
      </div>

      <div className="hero-copy">
        <p className="eyebrow">Producto destacado</p>
        <h1>{product.name}</h1>
        <p className="description">{product.description}</p>
      </div>

      <div className="price-panel">
        <div>
          <span className="label">Precio base</span>
          <strong>{formatCurrency(product.priceInCents, product.currency)}</strong>
        </div>
        <div>
          <span className="label">Stock disponible</span>
          <strong>{product.stock} unidades</strong>
        </div>
      </div>
    </section>
  )
}
