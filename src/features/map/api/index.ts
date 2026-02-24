import { http } from '@/lib/http'
import { createMapApi } from './realApi'
import { mockMapApi } from './mockApi'
import type { MapApi } from './types'

type ApiMode = 'mock' | 'real'

function getMode(): ApiMode {
  const raw = (import.meta.env.VITE_API_MODE as string | undefined) ?? 'mock'
  return raw === 'real' ? 'real' : 'mock'
}

export const mapApi: MapApi = getMode() === 'real' ? createMapApi(http) : mockMapApi

export type { MapApi } from './types'

