export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export class HttpClient {
  private baseUrl: string

  constructor(opts: { baseUrl?: string }) {
    this.baseUrl = opts.baseUrl ?? ''
  }

  async requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`

    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : null),
        ...(init?.headers ?? {}),
      },
    })

    const contentType = res.headers.get('content-type') ?? ''
    const body =
      contentType.includes('application/json') ? await res.json().catch(() => null) : await res.text()

    if (!res.ok) {
      throw new ApiError(`Request failed: ${res.status} ${res.statusText}`, res.status, body)
    }

    return body as T
  }
}

