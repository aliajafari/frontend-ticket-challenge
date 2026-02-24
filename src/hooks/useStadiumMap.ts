import { useState, useEffect } from 'react'
import { mapApi } from '@/modules/map'
import type { StadiumMap } from '@/types'

interface UseStadiumMapResult {
  map: StadiumMap | null
  loading: boolean
  error: string | null
}

export function useStadiumMap(): UseStadiumMapResult {
  const [map, setMap] = useState<StadiumMap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const mapIds = await mapApi.getMaps()
        const randomId = mapIds[Math.floor(Math.random() * mapIds.length)]
        if (!randomId) throw new Error('No maps available')

        const seats = await mapApi.getMap(randomId)
        if (!cancelled) {
          setMap({ id: randomId, seats })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load map')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return { map, loading, error }
}
