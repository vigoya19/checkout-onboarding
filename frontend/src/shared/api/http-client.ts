import { appEnv } from '@/shared/config/env'

export async function httpGet<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${appEnv.apiBaseUrl}${path}`)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return (await response.json()) as TResponse
}
