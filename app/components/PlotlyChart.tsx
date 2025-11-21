'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      <p className="text-gray-500">Loading Plotly library...</p>
    </div>
  )
})

interface PlotlyChartProps {
  data: any
  layout: any
}

export default function PlotlyChart({ data, layout }: PlotlyChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Wait for Plotly to be available
    const checkPlotly = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).Plotly) {
        setIsReady(true)
        clearInterval(checkPlotly)
      }
    }, 100)

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkPlotly)
      if (!isReady) {
        setError('Failed to load Plotly library')
      }
    }, 10000)

    return () => {
      clearInterval(checkPlotly)
      clearTimeout(timeout)
    }
  }, [data])

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-gray-500">Initializing chart...</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Plot
        data={data}
        layout={{
          ...layout,
          autosize: true,
          height: 600,
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
        onInitialized={(figure: any, graphDiv: any) => {
          // Force a resize after initialization
          setTimeout(() => {
            try {
              const Plotly = (window as any).Plotly
              if (Plotly && graphDiv) {
                Plotly.Plots.resize(graphDiv)
              }
            } catch (e) {
              // Ignore resize errors
            }
          }, 100)
        }}
        onError={() => {
          setError('Failed to render chart')
        }}
      />
    </div>
  )
}
