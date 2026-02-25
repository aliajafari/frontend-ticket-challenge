import type { MapList, SeatMatrix, TicketResponse } from '@/types'
import type { MapApi } from './types'

const MOCK_DELAY_MS = 300

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

// 40 columns × 50 rows = 2 000 seats; ~30 % randomly reserved.
const SAMPLE_MAP: SeatMatrix = Array.from({ length: 50 }, () =>
  Array.from({ length: 40 }, () => (Math.random() < 0.3 ? 1 : 0)),
) as SeatMatrix

export const mockMapApi: MapApi = {
  async getMaps(): Promise<MapList> {
    await delay(MOCK_DELAY_MS)
    return ['m213', 'm654', 'm63', 'm6888']
  },
  async getMap(mapId: string): Promise<SeatMatrix> {
    await delay(MOCK_DELAY_MS)
    void mapId
    return SAMPLE_MAP
  },
  async buyTicket(_mapId: string, _x: number, _y: number): Promise<TicketResponse> {
    await delay(MOCK_DELAY_MS)
    return { ticketId: crypto.randomUUID() }
  },
}

