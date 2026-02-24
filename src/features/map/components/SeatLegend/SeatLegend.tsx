import styles from './SeatLegend.module.css'

const ITEMS = [
  { label: 'Available', color: '#4CAF50' },
  { label: 'Reserved', color: '#F44336' },
  { label: 'Selected', color: '#FFC107' },
] as const

export function SeatLegend() {
  return (
    <div className={styles.legend}>
      {ITEMS.map(({ label, color }) => (
        <div key={label} className={styles.item}>
          <span className={styles.dot} style={{ backgroundColor: color }} />
          <span className={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  )
}
