import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MapPage } from './pages/MapPage/MapPage'
import { TicketPage } from './pages/TicketPage/TicketPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/ticket/:ticketId" element={<TicketPage />} />
      </Routes>
    </BrowserRouter>
  )
}
