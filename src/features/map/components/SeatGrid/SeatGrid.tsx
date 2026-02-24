import { useCallback } from 'react'
import type { SeatMatrix, SeatCoordinate } from '@/types'
import styles from './SeatGrid.module.css'

interface SeatGridProps {
  matrix: SeatMatrix
  selectedSeat: SeatCoordinate | null
  onSeatSelect: (coord: SeatCoordinate) => void
}

export function SeatGrid({ matrix, selectedSeat, onSeatSelect }: SeatGridProps) {
  // Event delegation via data-row / data-col
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement
      const rowAttr = target.dataset['row']
      const colAttr = target.dataset['col']
      if (rowAttr === undefined || colAttr === undefined) return

      const row = parseInt(rowAttr, 10)
      const col = parseInt(colAttr, 10)
      if (isNaN(row) || isNaN(col)) return

      if (matrix[row]?.[col] === 0) {
        onSeatSelect({ x: col, y: row })
      }
    },
    [matrix, onSeatSelect],
  )

  return (
    <div className={styles.wrapper} onClick={handleClick}>
      {matrix.map((row, rowIdx) => (
        <div key={rowIdx} className={styles.row} role="row">
          {row.map((status, colIdx) => {
            const isSelected = selectedSeat?.x === colIdx && selectedSeat?.y === rowIdx
            const isReserved = status === 1

            const seatClass = isSelected
              ? styles.seatSelected
              : isReserved
                ? styles.seatReserved
                : styles.seatAvailable

            return (
              <div
                key={colIdx}
                role="gridcell"
                className={`${styles.seat} ${seatClass}`}
                data-row={rowIdx}
                data-col={colIdx}
                aria-label={`Row ${rowIdx + 1} Seat ${colIdx + 1} — ${isReserved ? 'reserved' : isSelected ? 'selected' : 'available'}`}
                aria-selected={isSelected}
                aria-disabled={isReserved}
              >
                <div className={styles.popover}>
                  <span>Row: {rowIdx + 1}</span>
                  <span>Column: {colIdx + 1}</span>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
