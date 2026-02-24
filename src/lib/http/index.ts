import { HttpClient } from './HttpClient'

export const http = new HttpClient({
  baseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '',
})

export { HttpClient, ApiError } from './HttpClient'

