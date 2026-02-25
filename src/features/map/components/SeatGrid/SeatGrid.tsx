import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { SeatMatrix, SeatCoordinate } from '@/types'
import { Popover } from '@/shared/components/Popover/Popover'
import { GAP, PADDING, ZOOM_SCALE, type ZoomLevel } from '@/features/map/constants'
import styles from './SeatGrid.module.css'

interface SeatGridProps {
  matrix: SeatMatrix
  selectedSeat: SeatCoordinate | null
  onSeatSelect: (coord: SeatCoordinate) => void
}

export function SeatGrid({ matrix, selectedSeat, onSeatSelect }: SeatGridProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(1)
  const [vpWidth, setVpWidth] = useState(0)

  const cols = matrix[0]?.length ?? 1

  const baseSeatSize =
    vpWidth > 0
      ? Math.max(6, Math.min(36, Math.floor((vpWidth - PADDING * 2 - (cols - 1) * GAP) / cols)))
      : 28

  const seatSize = Math.round(baseSeatSize * ZOOM_SCALE[zoomLevel])
  const radius   = Math.max(3, Math.round(seatSize * 0.12))

  const rows = matrix.length
  const lockedViewportHeight =
    vpWidth > 0
      ? Math.min(600, rows * baseSeatSize + (rows - 1) * GAP + PADDING * 2)
      : undefined

  const pendingScrollRef = useRef<{
    baseX: number
    baseY: number
    px: number
    py: number
    prevScale: number
    nextScale: number
    behavior: ScrollBehavior
  } | null>(null)

  const gestureRef = useRef<{
    pointers: Map<number, { x: number; y: number }>
    panning: null | { startX: number; startY: number; startLeft: number; startTop: number }
    pinching: null | { startDist: number; baseX: number; baseY: number; px: number; py: number; startScale: number }
    lastTap: null | { t: number; x: number; y: number }
    suppressClickUntil: number
  }>({
    pointers: new Map(),
    panning: null,
    pinching: null,
    lastTap: null,
    suppressClickUntil: 0,
  })

  // Track viewport width to compute base seat size
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setVpWidth(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // After zoom, scroll so the focal point stays visually in place.
  // Runs synchronously after DOM paint so new seat sizes are already applied.
  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const p = pendingScrollRef.current
    if (!viewport || !p) return
    const ratio = p.nextScale / p.prevScale
    viewport.scrollTo({
      left: p.baseX * ratio - p.px,
      top:  p.baseY * ratio - p.py,
      behavior: p.behavior,
    })
    pendingScrollRef.current = null
  }, [zoomLevel])

  const zoomAtPoint = useCallback(
    (nextZoom: ZoomLevel, clientX: number, clientY: number, behavior: ScrollBehavior = 'smooth') => {
      const viewport = viewportRef.current
      if (!viewport) return
      const rect = viewport.getBoundingClientRect()
      const px = clientX - rect.left
      const py = clientY - rect.top
      pendingScrollRef.current = {
        baseX: viewport.scrollLeft + px,
        baseY: viewport.scrollTop + py,
        px,
        py,
        prevScale: ZOOM_SCALE[zoomLevel],
        nextScale: ZOOM_SCALE[nextZoom],
        behavior,
      }
      setZoomLevel(nextZoom)
    },
    [zoomLevel],
  )

  const zoomAtCenter = useCallback(
    (nextZoom: ZoomLevel) => {
      const viewport = viewportRef.current
      if (!viewport) return
      const rect = viewport.getBoundingClientRect()
      zoomAtPoint(nextZoom, rect.left + rect.width / 2, rect.top + rect.height / 2, 'smooth')
    },
    [zoomAtPoint],
  )

  // Non-passive wheel listener — prevents ctrl+wheel / trackpad pinch from zooming the page
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      const dir = e.deltaY < 0 ? 1 : -1
      const next = Math.min(3, Math.max(1, zoomLevel + dir)) as ZoomLevel
      if (next !== zoomLevel) zoomAtPoint(next, e.clientX, e.clientY, 'smooth')
    }
    const prevent = (e: Event) => e.preventDefault()

    viewport.addEventListener('wheel', onWheel, { passive: false })
    viewport.addEventListener('gesturestart', prevent, { passive: false } as AddEventListenerOptions)
    viewport.addEventListener('gesturechange', prevent, { passive: false } as AddEventListenerOptions)
    viewport.addEventListener('gestureend', prevent, { passive: false } as AddEventListenerOptions)

    return () => {
      viewport.removeEventListener('wheel', onWheel)
      viewport.removeEventListener('gesturestart', prevent)
      viewport.removeEventListener('gesturechange', prevent)
      viewport.removeEventListener('gestureend', prevent)
    }
  }, [zoomAtPoint, zoomLevel])

  // Event delegation — reads data-row / data-col from the clicked seat div
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (Date.now() < gestureRef.current.suppressClickUntil) return
      const target = e.target as HTMLElement
      const rowAttr = target.dataset['row']
      const colAttr = target.dataset['col']
      if (rowAttr === undefined || colAttr === undefined) return
      const row = parseInt(rowAttr, 10)
      const col = parseInt(colAttr, 10)
      if (isNaN(row) || isNaN(col)) return
      if (matrix[row]?.[col] === 0) onSeatSelect({ x: col, y: row })
    },
    [matrix, onSeatSelect],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const viewport = viewportRef.current
      if (!viewport) return

      gestureRef.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      const now = Date.now()
      const last = gestureRef.current.lastTap
      const isTouch = e.pointerType === 'touch'

      // Only capture touch — capturing mouse breaks click event delegation
      if (isTouch) viewport.setPointerCapture(e.pointerId)

      // Double-tap to zoom (touch only)
      if (isTouch && last && now - last.t < 320) {
        const dx = e.clientX - last.x
        const dy = e.clientY - last.y
        if (dx * dx + dy * dy < 24 * 24) {
          const next: ZoomLevel = zoomLevel === 3 ? 1 : ((zoomLevel + 1) as ZoomLevel)
          gestureRef.current.suppressClickUntil = now + 350
          gestureRef.current.lastTap = null
          zoomAtPoint(next, e.clientX, e.clientY, 'smooth')
          return
        }
      }

      if (isTouch) gestureRef.current.lastTap = { t: now, x: e.clientX, y: e.clientY }

      if (gestureRef.current.pointers.size === 1) {
        gestureRef.current.panning = {
          startX: e.clientX,
          startY: e.clientY,
          startLeft: viewport.scrollLeft,
          startTop:  viewport.scrollTop,
        }
      } else if (gestureRef.current.pointers.size === 2) {
        const pts = Array.from(gestureRef.current.pointers.values())
        const a = pts[0]!
        const b = pts[1]!
        const cx = (a.x + b.x) / 2
        const cy = (a.y + b.y) / 2
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        const rect = viewport.getBoundingClientRect()
        gestureRef.current.pinching = {
          startDist: dist,
          baseX: viewport.scrollLeft + (cx - rect.left),
          baseY: viewport.scrollTop  + (cy - rect.top),
          px: cx - rect.left,
          py: cy - rect.top,
          startScale: ZOOM_SCALE[zoomLevel],
        }
        gestureRef.current.panning = null
      }
    },
    [zoomAtPoint, zoomLevel],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const viewport = viewportRef.current
      if (!viewport) return

      const pointers = gestureRef.current.pointers
      if (!pointers.has(e.pointerId)) return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (pointers.size === 2 && gestureRef.current.pinching) {
        e.preventDefault()
        const pts = Array.from(pointers.values())
        const a = pts[0]!
        const b = pts[1]!
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        const ratio = dist / gestureRef.current.pinching.startDist
        const continuous = gestureRef.current.pinching.startScale * ratio
        const next: ZoomLevel = continuous < 1.5 ? 1 : continuous < 2.5 ? 2 : 3

        if (next !== zoomLevel) {
          pendingScrollRef.current = {
            baseX: gestureRef.current.pinching.baseX,
            baseY: gestureRef.current.pinching.baseY,
            px:    gestureRef.current.pinching.px,
            py:    gestureRef.current.pinching.py,
            prevScale: ZOOM_SCALE[zoomLevel],
            nextScale: ZOOM_SCALE[next],
            behavior: 'auto',
          }
          setZoomLevel(next)
        }

        gestureRef.current.suppressClickUntil = Date.now() + 350
        return
      }

      if (pointers.size === 1 && gestureRef.current.panning && e.pointerType === 'touch') {
        const dx = e.clientX - gestureRef.current.panning.startX
        const dy = e.clientY - gestureRef.current.panning.startY
        if (Math.abs(dx) + Math.abs(dy) > 4) {
          gestureRef.current.suppressClickUntil = Date.now() + 200
        }
        viewport.scrollLeft = gestureRef.current.panning.startLeft - dx
        viewport.scrollTop  = gestureRef.current.panning.startTop  - dy
      }
    },
    [zoomLevel],
  )

  const handlePointerUpOrCancel = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    gestureRef.current.pointers.delete(e.pointerId)
    if (gestureRef.current.pointers.size < 2) gestureRef.current.pinching = null
    if (gestureRef.current.pointers.size === 0) gestureRef.current.panning  = null
  }, [])

  const wrapperStyle = {
    '--seat-size': `${seatSize}px`,
    '--seat-gap':  `${GAP}px`,
    '--seat-radius': `${radius}px`,
  } as React.CSSProperties

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.zoomButton}
          disabled={zoomLevel === 1}
          onClick={(e) => {
            e.stopPropagation()
            gestureRef.current.suppressClickUntil = Date.now() + 250
            zoomAtCenter(Math.max(1, zoomLevel - 1) as ZoomLevel)
          }}
        >
          –
        </button>
        <button
          type="button"
          className={styles.zoomButton}
          disabled={zoomLevel === 3}
          onClick={(e) => {
            e.stopPropagation()
            gestureRef.current.suppressClickUntil = Date.now() + 250
            zoomAtCenter(Math.min(3, zoomLevel + 1) as ZoomLevel)
          }}
        >
          +
        </button>
      </div>

      <div
        ref={viewportRef}
        className={styles.viewport}
        style={lockedViewportHeight !== undefined ? { height: `${lockedViewportHeight}px` } : undefined}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
      >
        <div className={styles.wrapper} style={wrapperStyle}>
          {matrix.map((row, rowIdx) => (
            <div key={rowIdx} className={styles.row}>
              {row.map((status, colIdx) => {
                const isSelected = selectedSeat?.x === colIdx && selectedSeat?.y === rowIdx
                const isReserved  = status === 1
                const seatClass = isSelected
                  ? styles.seatSelected
                  : isReserved
                    ? styles.seatReserved
                    : styles.seatAvailable

                return (
                  <Popover
                    key={colIdx}
                    className={styles.seatTrigger}
                    content={
                      <>
                        <span>Row: {rowIdx + 1}</span>
                        <span>Column: {colIdx + 1}</span>
                      </>
                    }
                  >
                    <div
                      className={`${styles.seat} ${seatClass}`}
                      data-row={rowIdx}
                      data-col={colIdx}
                    />
                  </Popover>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
