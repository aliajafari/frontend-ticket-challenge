import { useState } from 'react'
import { useStadiumMap } from '@/hooks/useStadiumMap'
import { useTicket } from '@/hooks/useTicket'
import { SeatGrid } from '@/components/SeatGrid/SeatGrid'
import { SeatLegend } from '@/components/SeatLegend/SeatLegend'
import { LoadingSpinner } from '@/components/LoadingSpinner/LoadingSpinner'
import type { SeatCoordinate } from '@/types'
import styles from './MapPage.module.css'

export function MapPage() {
  const { map, loading: mapLoading, error: mapError } = useStadiumMap()
  const { purchaseTicket, loading: purchasing, error: purchaseError } = useTicket(map?.id ?? '')
  const [selectedSeat, setSelectedSeat] = useState<SeatCoordinate | null>(null)

  if (mapLoading) return <LoadingSpinner />
  if (mapError) return <p className={styles.error}>{mapError}</p>
  if (!map) return null

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Select Your Seat</h1>
        <p className={styles.subtitle}>Map ID: {map.id}</p>
      </header>

      <SeatLegend />

      <SeatGrid
        matrix={map.seats}
        selectedSeat={selectedSeat}
        onSeatSelect={setSelectedSeat}
      />

      {selectedSeat && (
        <div className={styles.footer}>
          <p className={styles.selection}>
            Selected: Row {selectedSeat.y + 1}, Seat {selectedSeat.x + 1}
          </p>
          <button
            className={styles.buyButton}
            onClick={() => void purchaseTicket(selectedSeat)}
            disabled={purchasing}
          >
            {purchasing ? 'Processing...' : 'Buy Ticket'}
          </button>
          {purchaseError && <p className={styles.error}>{purchaseError}</p>}
        </div>
      )}
    </main>
  )
}
