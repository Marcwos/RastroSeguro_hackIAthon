'use client'

import L from 'leaflet'
import { Circle, MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

export type MapLocation = {
  ciudad: string
  lat: number
  lng: number
}

type MapLayer = 'map' | 'satellite' | 'relief'

const LAYERS: Record<MapLayer, { label: string; url: string; attribution: string; maxZoom?: number }> = {
  map: {
    label: 'Mapa',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO',
  },
  satellite: {
    label: 'Satélite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18,
  },
  relief: {
    label: 'Relieve',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data &copy; OSM, SRTM | &copy; OpenTopoMap',
    maxZoom: 17,
  },
}

function createPinIcon() {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="position:relative;width:36px;height:44px;filter:drop-shadow(0 4px 8px rgba(0,0,0,.35));">
        <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0C9.716 0 3 6.477 3 14.47c0 10.588 15 29.53 15 29.53S33 25.058 33 14.47C33 6.477 26.284 0 18 0z" fill="var(--risk-rojo)"/>
          <circle cx="18" cy="14" r="6" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    tooltipAnchor: [0, -40],
  })
}

export function EcuadorLeafletMap({ location }: { location: MapLocation }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [layer, setLayer] = useState<MapLayer>('map')
  useEffect(() => setMounted(true), [])

  const baseLayer = useMemo(() => {
    if (layer !== 'map') return LAYERS[layer]
    if (resolvedTheme === 'dark') {
      return {
        ...LAYERS.map,
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      }
    }
    return LAYERS.map
  }, [layer, resolvedTheme])

  if (!mounted) {
    return (
      <div className="flex h-[min(320px,42vw)] min-h-[240px] w-full items-center justify-center bg-[var(--surface-container)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent motion-reduce:animate-none" />
      </div>
    )
  }

  const center: [number, number] = [location.lat, location.lng]

  return (
    <div className="relative h-[min(320px,42vw)] min-h-[240px] w-full overflow-hidden [&_.leaflet-container]:z-0 [&_.leaflet-control-attribution]:text-[9px] [&_.leaflet-control-attribution]:opacity-70">
      <div className="absolute right-3 top-3 z-[410] flex overflow-hidden rounded-full border border-border bg-background/90 p-1 shadow-lg backdrop-blur-md">
        {(Object.keys(LAYERS) as MapLayer[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setLayer(key)}
            className={cn(
              'rounded-full px-3 py-1.5 label-mono text-[11px] font-bold uppercase transition-colors',
              layer === key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-[var(--surface-container)] hover:text-foreground',
            )}
          >
            {LAYERS[key].label}
          </button>
        ))}
      </div>

      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ background: 'var(--surface-container)' }}
      >
        <TileLayer
          key={`${layer}-${resolvedTheme}`}
          attribution={baseLayer.attribution}
          url={baseLayer.url}
          maxZoom={baseLayer.maxZoom}
        />
        <Circle
          center={center}
          radius={12000}
          pathOptions={{
            color: 'var(--risk-rojo)',
            fillColor: 'var(--risk-rojo)',
            fillOpacity: layer === 'satellite' ? 0.18 : 0.12,
            weight: 2,
            dashArray: '6 4',
          }}
        />
        <Marker position={center} icon={createPinIcon()}>
          <Tooltip permanent direction="top" offset={[0, -40]} className="map-city-label">
            {location.ciudad}
          </Tooltip>
        </Marker>
      </MapContainer>
    </div>
  )
}
