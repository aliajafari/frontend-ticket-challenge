import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SeatLegend } from './SeatLegend'

describe('SeatLegend', () => {
  it('renders the Available label', () => {
    render(<SeatLegend />)
    expect(screen.getByText('Available')).toBeInTheDocument()
  })

  it('renders the Reserved label', () => {
    render(<SeatLegend />)
    expect(screen.getByText('Reserved')).toBeInTheDocument()
  })

  it('renders the Selected label', () => {
    render(<SeatLegend />)
    expect(screen.getByText('Selected')).toBeInTheDocument()
  })

  it('renders exactly three legend items', () => {
    render(<SeatLegend />)
    const items = screen.getAllByText(/^(Available|Reserved|Selected)$/)
    expect(items).toHaveLength(3)
  })
})
