import { SEAT_LEGEND_ITEMS } from '@/features/map/constants'
import styles from './SeatLegend.module.css'

export function SeatLegend() {
  return (
    <div className={styles.legend}>
      {SEAT_LEGEND_ITEMS.map(({ label, color }) => (
        <div key={label} className={styles.item}>
          <span className={styles.dot} style={{ backgroundColor: color }} />
          <span className={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  )
}
