import { formatCurrency } from '@/shared/lib/currency'
import type { Product } from '@/shared/types/product'

type ProductHeroProps = {
  product: Product | null
}

export function ProductHero({ product }: ProductHeroProps) {
  if (!product) {
    return (
      <section className="shell card hero-card">
        <div className="hero-main">
          <div className="hero-copy">
            <div className="badge-row">
              <span className="badge badge-primary">Checkout onboarding</span>
              <span className="badge">Mobile first</span>
            </div>

            <p className="eyebrow">Catalogo</p>
            <h1>Sin productos disponibles</h1>
            <p className="description">
              Cuando la API devuelva productos sembrados, el checkout quedara
              habilitado desde aqui.
            </p>
          </div>

          <div className="hero-showcase">
            <div className="hero-console-glow" />
            <div className="hero-console-card">
              <span className="hero-console-tag">Estado</span>
              <strong>Catalogo vacio</strong>
              <p>Revisa el backend o vuelve a cargar para intentar otra vez.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="shell card hero-card">
      <div className="hero-main">
        <div className="hero-copy">
          <div className="badge-row">
            <span className="badge badge-primary">Checkout onboarding</span>
            <span className="badge">Mobile first</span>
          </div>

          <p className="eyebrow">Producto seleccionado</p>
          <h1>{product.name}</h1>
          <p className="description">{product.description}</p>

          <div className="hero-meta">
            <div className="hero-meta-item">
              <span className="label">Precio de venta</span>
              <strong>{formatCurrency(product.priceInCents, product.currency)}</strong>
            </div>
            <div className="hero-meta-item">
              <span className="label">Disponibilidad</span>
              <strong>{product.stock} unidades</strong>
            </div>
          </div>
        </div>

        <div className="hero-showcase">
          <div className="hero-console-glow" />
          <div className="hero-console-card">
            <span className="hero-console-tag">Compra directa</span>
            <strong>{product.name}</strong>
            <p>Checkout de un solo producto, sin carrito, como pide la prueba.</p>

            <div className="hero-console-specs">
              <div>
                <span>Fee base</span>
                <strong>Fijo</strong>
              </div>
              <div>
                <span>Entrega</span>
                <strong>Incluida</strong>
              </div>
              <div>
                <span>Estado</span>
                <strong>Listo para pagar</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
