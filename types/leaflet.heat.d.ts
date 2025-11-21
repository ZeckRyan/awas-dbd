declare module 'leaflet.heat' {
  import * as L from 'leaflet'

  interface HeatLayerOptions {
    radius?: number
    blur?: number
    maxZoom?: number
    max?: number
    gradient?: { [key: string]: string }
  }

  namespace L {
    function heatLayer(
      latlngs: number[][],
      options?: HeatLayerOptions
    ): any
  }

  export = L
}
