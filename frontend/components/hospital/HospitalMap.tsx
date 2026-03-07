'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { type Hospital } from '@/lib/api'

// Fix leaflet icon issue in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const userIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;background:#3B82F6;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  className: '',
})

const hospitalIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;background:#0D9488;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  className: '',
})

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng], 13) }, [lat, lng, map])
  return null
}

interface HospitalMapProps {
  userLat: number
  userLng: number
  hospitals: Hospital[]
}

export default function HospitalMap({ userLat, userLng, hospitals }: HospitalMapProps) {
  return (
    <MapContainer
      center={[userLat, userLng]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap lat={userLat} lng={userLng} />
      <Marker position={[userLat, userLng]} icon={userIcon}>
        <Popup>📍 You are here</Popup>
      </Marker>
      {hospitals.map(hospital => (
        <Marker key={hospital.id} position={[hospital.lat, hospital.lng]} icon={hospitalIcon}>
          <Popup>
            <div>
              <strong>{hospital.name}</strong><br />
              {hospital.type}<br />
              {hospital.address}<br />
              {hospital.distance_km !== undefined && `${hospital.distance_km.toFixed(1)} km away`}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
