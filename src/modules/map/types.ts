import type { MapList, SeatMatrix, TicketResponse } from '@/types'

export interface MapApi {
  getMaps(): Promise<MapList>
  getMap(mapId: string): Promise<SeatMatrix>
  buyTicket(mapId: string, x: number, y: number): Promise<TicketResponse>
}

