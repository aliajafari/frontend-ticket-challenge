import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeAll } from 'vitest'
import { SeatGrid } from './SeatGrid'
import type { SeatCoordinate } from '@/types'

// jsdom does not implement ResizeObserver or Element.scrollTo
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver

  Element.prototype.scrollTo = vi.fn()
})

const MATRIX = [
  [0, 1, 0], // row 0: available, reserved, available
  [0, 0, 1], // row 1: available, available, reserved
] as const satisfies (0 | 1)[][]

function setup(selectedSeat: SeatCoordinate | null = null) {
  const onSeatSelect = vi.fn()
  render(<SeatGrid matrix={MATRIX} selectedSeat={selectedSeat} onSeatSelect={onSeatSelect} />)
  return { onSeatSelect }
}

function getSeat(row: number, col: number) {
  return document.querySelector(`[data-row="${row}"][data-col="${col}"]`) as HTMLElement
}

describe('SeatGrid — rendering', () => {
  it('renders one element per matrix cell', () => {
    setup()
    expect(document.querySelectorAll('[data-row]')).toHaveLength(6)
  })

  it('assigns correct data-row / data-col attributes', () => {
    setup()
    expect(getSeat(0, 2)).toBeInTheDocument()
    expect(getSeat(1, 1)).toBeInTheDocument()
  })

  it('includes Row and Column labels in popover content', () => {
    setup()
    expect(screen.getAllByText('Row: 1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Column: 3').length).toBeGreaterThan(0)
  })
})

describe('SeatGrid — seat selection', () => {
  it('calls onSeatSelect with {x, y} when clicking an available seat', async () => {
    const { onSeatSelect } = setup()
    await userEvent.click(getSeat(0, 0))
    expect(onSeatSelect).toHaveBeenCalledOnce()
    expect(onSeatSelect).toHaveBeenCalledWith({ x: 0, y: 0 })
  })

  it('calls onSeatSelect with correct coordinates for any available seat', async () => {
    const { onSeatSelect } = setup()
    await userEvent.click(getSeat(1, 1))
    expect(onSeatSelect).toHaveBeenCalledWith({ x: 1, y: 1 })
  })

  it('does not call onSeatSelect when clicking a reserved seat', async () => {
    const { onSeatSelect } = setup()
    await userEvent.click(getSeat(0, 1)) // reserved
    expect(onSeatSelect).not.toHaveBeenCalled()
  })

  it('does not call onSeatSelect for the last-column reserved seat', async () => {
    const { onSeatSelect } = setup()
    await userEvent.click(getSeat(1, 2)) // reserved
    expect(onSeatSelect).not.toHaveBeenCalled()
  })

  it('clicking the viewport background (no seat) does not call onSeatSelect', async () => {
    const { onSeatSelect } = setup()
    const wrapper = document.querySelector('[class]') as HTMLElement
    await userEvent.click(wrapper)
    expect(onSeatSelect).not.toHaveBeenCalled()
  })
})

describe('SeatGrid — zoom controls', () => {
  it('zoom-out (–) button is disabled at the initial zoom level', () => {
    setup()
    expect(screen.getByText('–')).toBeDisabled()
  })

  it('zoom-in (+) button is enabled at the initial zoom level', () => {
    setup()
    expect(screen.getByText('+')).toBeEnabled()
  })

  it('enables zoom-out after clicking zoom-in once', async () => {
    setup()
    await userEvent.click(screen.getByText('+'))
    expect(screen.getByText('–')).toBeEnabled()
  })

  it('disables zoom-in after reaching maximum zoom (level 3)', async () => {
    setup()
    await userEvent.click(screen.getByText('+'))
    await userEvent.click(screen.getByText('+'))
    expect(screen.getByText('+')).toBeDisabled()
  })

  it('re-disables zoom-out after zooming back to level 1', async () => {
    setup()
    await userEvent.click(screen.getByText('+'))
    await userEvent.click(screen.getByText('–'))
    expect(screen.getByText('–')).toBeDisabled()
  })

  it('zoom-in remains enabled when not at maximum', async () => {
    setup()
    await userEvent.click(screen.getByText('+'))
    expect(screen.getByText('+')).toBeEnabled()
  })
})
