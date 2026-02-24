import { useParams, useNavigate } from 'react-router-dom'
import styles from './TicketPage.module.css'

export function TicketPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const navigate = useNavigate()

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>🎟</div>
        <h1 className={styles.title}>Booking Confirmed!</h1>
        <p className={styles.label}>Your Ticket ID</p>
        <p className={styles.ticketId}>{ticketId}</p>
        <button className={styles.backButton} onClick={() => void navigate('/')}>
          Back to Seat Map
        </button>
      </div>
    </main>
  )
}
