import { httpGet } from '@/shared/api/http-client'
import type { Product } from '@/shared/types/product'

type ProductResponse = {
  id?: string
  productId?: string
  name: string
  description: string
  features?: string[]
  priceInCents: number
  currency: 'COP'
  stock: number
}

const featuredProductOrder = [
  'prod_ps5',
  'prod_ps4',
  'prod_xbox_series_x',
  'prod_xbox_series_s',
  'prod_nintendo_switch',
  'prod_nintendo_switch_2',
] as const

function getProductOrderIndex(productId: string) {
  const index = featuredProductOrder.indexOf(
    productId as (typeof featuredProductOrder)[number],
  )

  return index >= 0 ? index : Number.MAX_SAFE_INTEGER
}

function toProduct(response: ProductResponse): Product {
  const id = response.id ?? response.productId ?? ''

  return {
    id,
    name: response.name,
    description: response.description,
    features: response.features ?? [],
    priceInCents: response.priceInCents,
    currency: response.currency,
    stock: response.stock,
  }
}

export async function listProducts(): Promise<Product[]> {
  const response = await httpGet<ProductResponse[]>('/products')

  return response
    .map(toProduct)
    .sort(
      (left, right) =>
        getProductOrderIndex(left.id) - getProductOrderIndex(right.id),
    )
}
