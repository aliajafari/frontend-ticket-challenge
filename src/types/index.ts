export type SeatMatrix = (0 | 1)[][]

export interface SeatCoordinate {
  x: number
  y: number
}

export type SeatStatus = 'available' | 'reserved' | 'selected'

export interface TicketResponse {
  ticketId: string
}

export type MapList = string[]

export interface StadiumMap {
  id: string
  seats: SeatMatrix
}
