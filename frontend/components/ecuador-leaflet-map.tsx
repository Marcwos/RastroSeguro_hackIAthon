'use client'

import L from 'leaflet'
import { Circle, MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export type MapLocation = {
  ciudad: string
  lat: number
  lng: number
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
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="flex h-[min(320px,42vw)] min-h-[240px] w-full items-center justify-center bg-[var(--surface-container)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent motion-reduce:animate-none" />
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

  const center: [number, number] = [location.lat, location.lng]

  return (
    <div className="relative h-[min(320px,42vw)] min-h-[240px] w-full [&_.leaflet-container]:z-0 [&_.leaflet-control-attribution]:text-[9px] [&_.leaflet-control-attribution]:opacity-70">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ background: 'var(--surface-container)' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO'
          url={tileUrl}
        />
        <Circle
          center={center}
          radius={12000}
          pathOptions={{
            color: 'var(--risk-rojo)',
            fillColor: 'var(--risk-rojo)',
            fillOpacity: 0.12,
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
