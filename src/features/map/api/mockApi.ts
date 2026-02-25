import type { MapList, SeatMatrix, TicketResponse } from '@/types'
import type { MapApi } from './types'
import { MOCK_DELAY_MS, SAMPLE_MAP } from '@/features/map/constants'

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

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

