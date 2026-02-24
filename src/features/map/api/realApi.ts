import type { MapList, SeatMatrix, TicketResponse } from '@/types'
import type { HttpClient } from '@/lib/http'
import type { MapApi } from './types'

export function createMapApi(http: HttpClient): MapApi {
  return {
    getMaps(): Promise<MapList> {
      return http.requestJson<MapList>('/map')
    },
    getMap(mapId: string): Promise<SeatMatrix> {
      return http.requestJson<SeatMatrix>(`/map/${encodeURIComponent(mapId)}`)
    },
    buyTicket(mapId: string, x: number, y: number): Promise<TicketResponse> {
      return http.requestJson<TicketResponse>(`/map/${encodeURIComponent(mapId)}/ticket`, {
        method: 'POST',
        body: JSON.stringify({ x, y }),
      })
    },
  }
}

