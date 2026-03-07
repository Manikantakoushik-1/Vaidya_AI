import { MapPin, Phone, Navigation, Building2 } from 'lucide-react'
import { type Hospital } from '@/lib/api'

interface HospitalCardProps {
  hospital: Hospital
}

const typeColors: Record<string, string> = {
  'Government': 'bg-blue-100 text-blue-700',
  'Private': 'bg-purple-100 text-purple-700',
  'CHC': 'bg-teal-100 text-teal-700',
  'PHC': 'bg-green-100 text-green-700',
  'District Hospital': 'bg-indigo-100 text-indigo-700',
}

export default function HospitalCard({ hospital }: HospitalCardProps) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">{hospital.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[hospital.type] || 'bg-gray-100 text-gray-600'}`}>
              {hospital.type}
            </span>
          </div>
        </div>
        {hospital.distance_km !== undefined && (
          <span className="text-sm font-semibold text-teal-600 dark:text-teal-400 whitespace-nowrap">
            {hospital.distance_km.toFixed(1)} km
          </span>
        )}
      </div>

      <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{hospital.address}, {hospital.district}</span>
      </div>

      <div className="flex items-center gap-3 mt-4">
        {hospital.phone && (
          <a
            href={`tel:${hospital.phone}`}
            className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 hover:text-green-700 font-medium"
          >
            <Phone className="w-4 h-4" />
            {hospital.phone}
          </a>
        )}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 ml-auto text-sm bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          <Navigation className="w-4 h-4" />
          Directions
        </a>
      </div>
    </div>
  )
}
