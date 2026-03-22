import { httpGet } from '@/shared/api/http-client'
import type { Product } from '@/shared/types/product'

type ProductResponse = {
  id?: string
  productId?: string
  name: string
  description: string
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

function toProduct(response: ProductResponse): Product {
  return {
    id: response.id ?? response.productId ?? '',
    name: response.name,
    description: response.description,
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
        featuredProductOrder.indexOf(left.id as (typeof featuredProductOrder)[number]) -
        featuredProductOrder.indexOf(right.id as (typeof featuredProductOrder)[number]),
    )
}
