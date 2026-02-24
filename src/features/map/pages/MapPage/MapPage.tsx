import { useState } from 'react'
import { useStadiumMap, useTicket } from '@/features/map/hooks'
import { SeatGrid } from '@/features/map/components/SeatGrid/SeatGrid'
import { SeatLegend } from '@/features/map/components/SeatLegend/SeatLegend'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner/LoadingSpinner'
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

      <div className={styles.footer}>
        <p className={styles.selection}>
          {selectedSeat
            ? `Selected: Row ${selectedSeat.y + 1}, Seat ${selectedSeat.x + 1}`
            : 'Select a seat to continue'}
        </p>
        <button
          className={styles.buyButton}
          onClick={() => (selectedSeat ? void purchaseTicket(selectedSeat) : undefined)}
          disabled={purchasing || !selectedSeat}
        >
          {purchasing ? 'Processing...' : 'Buy Ticket'}
        </button>
        {purchaseError && <p className={styles.error}>{purchaseError}</p>}
      </div>
    </main>
  )
}
