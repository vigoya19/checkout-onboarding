import { useMemo, useState } from 'react'

const PRODUCT_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'] as const

const PRODUCT_IMAGE_ALIASES: Record<string, string[]> = {
  playstation5: ['ps5', 'PlayStation5', 'playstation5'],
  playstation4: ['ps4', 'play4', 'PlayStation4', 'playstation4'],
  xboxseriesx: ['xboxSeriesX', 'XboxSeriesX', 'xboxseriesx'],
  xboxseriess: ['xboxSeriesS', 'XboxSeriesS', 'xboxseriess'],
  nintendoswitch: ['nintendoswitch', 'NintendoSwitch', 'switch'],
  nintendoswitch2: ['nintendoswitch2', 'NintendoSwitch2', 'switch2'],
}

function normalizeProductName(productName: string) {
  return productName.replace(/[^a-z0-9]/gi, '').toLowerCase()
}

function buildProductImageBaseNames(productName: string) {
  const compact = productName.replace(/\s+/g, '')
  const normalized = normalizeProductName(productName)
  const lowerCompact = compact.toLowerCase()
  const kebab = productName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const aliases = PRODUCT_IMAGE_ALIASES[normalized] ?? []

  return Array.from(
    new Set([productName, compact, lowerCompact, kebab, normalized, ...aliases]),
  )
}

function buildProductImageCandidates(productName: string) {
  const baseNames = buildProductImageBaseNames(productName)

  return baseNames.flatMap((baseName) =>
    PRODUCT_IMAGE_EXTENSIONS.map(
      (extension) => `/product-images/${encodeURIComponent(baseName)}.${extension}`,
    ),
  )
}

type ProductImageProps = {
  productName: string
  className?: string
}

export function ProductImage({ productName, className }: ProductImageProps) {
  const candidates = useMemo(
    () => buildProductImageCandidates(productName),
    [productName],
  )
  const [candidateIndex, setCandidateIndex] = useState(0)

  const currentSource = candidates[candidateIndex]

  if (!currentSource) {
    return (
      <div className={className ? `${className} product-image-fallback` : 'product-image-fallback'}>
        <span>{productName.charAt(0).toUpperCase()}</span>
      </div>
    )
  }

  return (
    <img
      alt={productName}
      className={className}
      onError={() => setCandidateIndex((current) => current + 1)}
      src={currentSource}
    />
  )
}
