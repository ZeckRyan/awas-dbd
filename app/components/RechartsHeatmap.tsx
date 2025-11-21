'use client'

import { useEffect, useState } from 'react'

interface HeatmapData {
  lat: number
  lon: number
  value: number
}

interface RechartsHeatmapProps {
  data: any
  layout: any
}

export default function RechartsHeatmap({ data, layout }: RechartsHeatmapProps) {
  const [processedData, setProcessedData] = useState<HeatmapData[]>([])
  const [bounds, setBounds] = useState({
    minLat: 0,
    maxLat: 0,
    minLon: 0,
    maxLon: 0,
  })

  useEffect(() => {
    if (!data || !data[0]) return

    const heatmapData: HeatmapData[] = []
    const trace = data[0]

    if (trace.lat && trace.lon && trace.z) {
      const latArray = trace.lat
      const lonArray = trace.lon
      const zArray = Array.isArray(trace.z) ? trace.z : []

      for (let i = 0; i < latArray.length; i++) {
        heatmapData.push({
          lat: latArray[i],
          lon: lonArray[i],
          value: zArray[i] || 0,
        })
      }

      const lats = heatmapData.map(d => d.lat)
      const lons = heatmapData.map(d => d.lon)

      setBounds({
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats),
        minLon: Math.min(...lons),
        maxLon: Math.max(...lons),
      })
    }

    setProcessedData(heatmapData)
  }, [data])

  const getColor = (value: number) => {
    // Color gradient: blue (0) -> yellow (0.5) -> red (1)
    if (value < 0.5) {
      const ratio = value * 2
      return `rgb(${Math.round(ratio * 255)}, ${Math.round(ratio * 255)}, ${Math.round(255 - ratio * 255)})`
    } else {
      const ratio = (value - 0.5) * 2
      return `rgb(${Math.round(255)}, ${Math.round(255 - ratio * 255)}, 0)`
    }
  }

  const mapWidth = 800
  const mapHeight = 600
  const padding = 40

  const scaleX = (lon: number) => {
    const range = bounds.maxLon - bounds.minLon
    return ((lon - bounds.minLon) / range) * (mapWidth - 2 * padding) + padding
  }

  const scaleY = (lat: number) => {
    const range = bounds.maxLat - bounds.minLat
    return mapHeight - (((lat - bounds.minLat) / range) * (mapHeight - 2 * padding) + padding)
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        {layout?.title?.text || 'Heatmap Visualization'}
      </h3>
      
      <svg
        width={mapWidth}
        height={mapHeight}
        style={{ border: '1px solid #e5e7eb' }}
      >
        {/* Background */}
        <rect width={mapWidth} height={mapHeight} fill="#f9fafb" />

        {/* Draw points */}
        {processedData.map((point, idx) => (
          <circle
            key={idx}
            cx={scaleX(point.lon)}
            cy={scaleY(point.lat)}
            r={8}
            fill={getColor(point.value)}
            opacity={0.6}
            stroke="white"
            strokeWidth={1}
          >
            <title>{`Lat: ${point.lat.toFixed(2)}, Lon: ${point.lon.toFixed(2)}, Value: ${point.value}`}</title>
          </circle>
        ))}

        {/* Legend */}
        <g transform={`translate(${mapWidth - 100}, 20)`}>
          <text x="0" y="0" fontSize="12" fontWeight="bold" fill="#374151">
            Legend
          </text>
          <rect x="0" y="10" width="20" height="20" fill="rgb(0, 0, 255)" />
          <text x="25" y="25" fontSize="11" fill="#6b7280">Low (0)</text>
          
          <rect x="0" y="40" width="20" height="20" fill="rgb(255, 255, 0)" />
          <text x="25" y="55" fontSize="11" fill="#6b7280">Med (0.5)</text>
          
          <rect x="0" y="70" width="20" height="20" fill="rgb(255, 0, 0)" />
          <text x="25" y="85" fontSize="11" fill="#6b7280">High (1)</text>
        </g>
      </svg>

      <p className="text-sm text-gray-500 mt-4">
        Menampilkan {processedData.length} titik data
      </p>
    </div>
  )
}
