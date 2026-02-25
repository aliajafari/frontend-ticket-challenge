import type { SeatMatrix } from '@/types'

export type ZoomLevel = 1 | 2 | 3

// Zoom and layout
export const ZOOM_SCALE: Record<ZoomLevel, number> = { 1: 1, 2: 2, 3: 3 }
export const GAP = 4
export const PADDING = 12

// Mock API
export const MOCK_DELAY_MS = 300

export const SAMPLE_MAP: SeatMatrix = [
  [0, 0, 1, 0],
  [0, 1, 0, 0],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
]

// Seat legend
export const SEAT_LEGEND_ITEMS = [
  { label: 'Available', color: '#4CAF50' },
  { label: 'Reserved',  color: '#F44336' },
  { label: 'Selected',  color: '#FFC107' },
] as const

