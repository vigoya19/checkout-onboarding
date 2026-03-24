import { appEnv } from '@/shared/config/env'

type ApiErrorBody = {
  message?: string | string[]
}

async function readErrorMessage(response: Response) {
  const fallbackMessage = `Request failed with status ${response.status}`
  const errorText = await response.text()

  if (!errorText) {
    return fallbackMessage
  }

  try {
    const errorBody = JSON.parse(errorText) as ApiErrorBody

    if (typeof errorBody.message === 'string' && errorBody.message.trim()) {
      return errorBody.message
    }

    if (Array.isArray(errorBody.message) && errorBody.message.length > 0) {
      return errorBody.message.join('. ')
    }
  } catch {
    return errorText
  }

  return fallbackMessage
}

async function request<TResponse>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init)

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return (await response.json()) as TResponse
}

export async function httpGet<TResponse>(path: string): Promise<TResponse> {
  return request<TResponse>(`${appEnv.apiBaseUrl}${path}`)
}

export async function httpPost<TResponse, TPayload>(
  path: string,
  payload: TPayload,
): Promise<TResponse> {
  return request<TResponse>(`${appEnv.apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}
