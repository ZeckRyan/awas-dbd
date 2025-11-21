'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'

interface LeafletMapProps {
  data: any
  layout?: any
}

// Heatmap layer component
function HeatmapLayer({ points }: { points: number[][] }) {
  const map = useMap()
  const heatmapRef = useRef<any>(null)

  useEffect(() => {
    if (!map) {
      console.log('HeatmapLayer: Map not ready')
      return
    }

    if (!points || points.length === 0) {
      console.log('HeatmapLayer: No points to display', { pointsLength: points?.length })
      return
    }

    console.log('HeatmapLayer: Starting to create heatmap with', points.length, 'points')
    console.log('Sample points:', points.slice(0, 3))

    // Dynamically import leaflet and leaflet.heat
    const loadHeatmap = async () => {
      try {
        const L = await import('leaflet')
        await import('leaflet.heat')
        
        console.log('HeatmapLayer: Libraries loaded successfully')

        // Remove existing heatmap layer if any
        if (heatmapRef.current) {
          console.log('HeatmapLayer: Removing old layer')
          map.removeLayer(heatmapRef.current)
        }

        // Create heatmap layer with enhanced visibility
        console.log('HeatmapLayer: Creating heatLayer...')
        const heatLayer = (L as any).heatLayer(points, {
          radius: 35,
          blur: 20,
          maxZoom: 17,
          max: 1.0,
          minOpacity: 0.6,
          gradient: {
            0.0: '#ffff00',
            0.25: '#ffdd00',
            0.5: '#ffaa00',
            0.75: '#ff5500',
            1.0: '#ff0000'
          }
        })

        heatmapRef.current = heatLayer
        heatLayer.addTo(map)

        console.log('HeatmapLayer: ✓ Successfully added to map!')

        // Don't auto-fit bounds, let user see full Indonesia map
        // if (points.length > 0) {
        //   const bounds = points.map(p => [p[0], p[1]] as [number, number])
        //   map.fitBounds(bounds as any, { padding: [50, 50] })
        // }
      } catch (err) {
        console.error('HeatmapLayer: Failed to load heatmap:', err)
      }
    }

    loadHeatmap()

    return () => {
      if (heatmapRef.current && map) {
        try {
          map.removeLayer(heatmapRef.current)
          console.log('HeatmapLayer: Cleaned up layer')
        } catch (e) {
          console.error('Error removing heatmap layer:', e)
        }
      }
    }
  }, [map, points])

  return null
}

// Wrapper component to handle SSR
const LeafletMapWrapper = dynamic(
  () => Promise.resolve(({ data, layout }: LeafletMapProps) => {
    const [heatmapPoints, setHeatmapPoints] = useState<number[][]>([])

    useEffect(() => {
      // Process data for heatmap
      console.log('LeafletMapWrapper: Processing data...', { hasData: !!data })
      
      if (data && data[0]) {
        const trace = data[0]
        const points: number[][] = []

        if (trace.lat && trace.lon && trace.z) {
          const latArray = Array.isArray(trace.lat) ? trace.lat : []
          const lonArray = Array.isArray(trace.lon) ? trace.lon : []
          const zArray = Array.isArray(trace.z) ? trace.z : []

          console.log('LeafletMapWrapper: Raw data arrays:', {
            latCount: latArray.length,
            lonCount: lonArray.length,
            zCount: zArray.length,
            sampleLat: latArray.slice(0, 5),
            sampleLon: lonArray.slice(0, 5),
            sampleZ: zArray.slice(0, 10)
          })

          for (let i = 0; i < latArray.length; i++) {
            const lat = latArray[i]
            const lon = lonArray[i]
            const z = zArray[i]
            
            // ALL points should be visible
            // Scale intensity: z is 0 or 1, we make both visible
            // 0 (negative) -> 0.5, 1 (positive/DBD) -> 1.0
            const intensity = z === 1 ? 1.0 : 0.5
            
            // Format: [latitude, longitude, intensity]
            points.push([lat, lon, intensity])
          }

          console.log('LeafletMapWrapper: ✓ Processed', points.length, 'data points')
          console.log('LeafletMapWrapper: Sample processed points:', points.slice(0, 3))
          setHeatmapPoints(points)
        } else {
          console.error('LeafletMapWrapper: Missing lat/lon/z in trace data')
        }
      } else {
        console.error('LeafletMapWrapper: No data or data[0] not found')
      }
    }, [data])

    return (
      <div className="w-full h-full relative">
        <MapContainer
          center={[-2.5, 117.5]}
          zoom={5}
          style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {heatmapPoints.length > 0 && <HeatmapLayer points={heatmapPoints} />}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
          <h4 className="text-xs font-bold mb-2 text-gray-800">Tingkat Kasus DBD</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fef3c7' }}></div>
              <span className="text-xs text-gray-600">Sangat Rendah</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fcd34d' }}></div>
              <span className="text-xs text-gray-600">Rendah</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
              <span className="text-xs text-gray-600">Sedang</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#d97706' }}></div>
              <span className="text-xs text-gray-600">Tinggi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#b45309' }}></div>
              <span className="text-xs text-gray-600">Sangat Tinggi</span>
            </div>
          </div>
        </div>

        {/* Controls Info */}
        <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-md z-[1000]">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Scroll untuk zoom, drag untuk pan</span>
          </div>
        </div>
      </div>
    )
  }),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat peta...</p>
        </div>
      </div>
    )
  }
)

export default function LeafletMap({ data, layout }: LeafletMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat peta...</p>
        </div>
      </div>
    )
  }

  return <LeafletMapWrapper data={data} layout={layout} />
}
