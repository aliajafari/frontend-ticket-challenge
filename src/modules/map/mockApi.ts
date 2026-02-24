import type { MapList, SeatMatrix, TicketResponse } from '@/types'
import type { MapApi } from './types'

const MOCK_DELAY_MS = 300

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

function generateMatrix(mapId: string): SeatMatrix {
  const hash = mapId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

  const rows = 7 + (hash % 6)
  const cols = 10 + (hash % 6)

  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => {
      const seed = (row * 31 + col * 17 + hash) % 10
      return seed < 3 ? 1 : 0
    }) as (0 | 1)[],
  )
}

export const mockMapApi: MapApi = {
  async getMaps(): Promise<MapList> {
    await delay(MOCK_DELAY_MS)
    return ['m213', 'm654', 'm63', 'm6888']
  },
  async getMap(mapId: string): Promise<SeatMatrix> {
    await delay(MOCK_DELAY_MS)
    return generateMatrix(mapId)
  },
  async buyTicket(_mapId: string, _x: number, _y: number): Promise<TicketResponse> {
    await delay(MOCK_DELAY_MS)
    return { ticketId: crypto.randomUUID() }
  },
}

