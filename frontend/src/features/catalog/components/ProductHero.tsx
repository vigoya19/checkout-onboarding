import { formatCurrency } from '@/shared/lib/currency'
import type { Product } from '@/shared/types/product'
import { ProductImage } from '@/features/catalog/components/ProductImage'

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
              Cuando la API devuelva productos sembrados, la compra estara
              disponible desde aqui.
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

          <div className="hero-details-grid">
            <div className="hero-detail-card">
              <span className="label">Descripcion</span>
              <p>{product.description}</p>
            </div>

            <div className="hero-detail-card">
              <span className="label">Caracteristicas</span>
              {product.features.length > 0 ? (
                <ul className="hero-feature-list">
                  {product.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              ) : (
                <p>Las caracteristicas del producto estaran disponibles aqui.</p>
              )}
            </div>
          </div>
        </div>

        <div className="hero-showcase">
          <div className="hero-console-glow" />
          <div className="hero-console-card">
            <div className="hero-product-image-shell">
              <ProductImage
                className="hero-product-image"
                key={product.name}
                productName={product.name}
              />
            </div>
            <span className="hero-console-tag">Compra directa</span>
            <strong>{product.name}</strong>
            <p>
              Compra de un solo producto con pago guiado y datos de entrega.
            </p>

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
