import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mapApi } from '@/features/map/api'
import type { SeatCoordinate } from '@/types'

interface UseTicketResult {
  purchaseTicket: (coord: SeatCoordinate) => Promise<void>
  loading: boolean
  error: string | null
}

export function useTicket(mapId: string): UseTicketResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function purchaseTicket(coord: SeatCoordinate): Promise<void> {
    try {
      setLoading(true)
      setError(null)
      const { ticketId } = await mapApi.buyTicket(mapId, coord.x, coord.y)
      void navigate(`/ticket/${ticketId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed')
    } finally {
      setLoading(false)
    }
  }

  return { purchaseTicket, loading, error }
}

