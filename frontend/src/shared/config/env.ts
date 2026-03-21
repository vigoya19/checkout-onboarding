export const appEnv = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  wompiBaseUrl:
    import.meta.env.VITE_WOMPI_BASE_URL ??
    'https://api-sandbox.co.uat.wompi.dev/v1',
  wompiPublicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY ?? '',
} as const
