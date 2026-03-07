'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import HospitalList from '@/components/hospital/HospitalList'
import { useGeolocation } from '@/hooks/useGeolocation'
import { getNearbyHospitals, type Hospital } from '@/lib/api'

const HospitalMap = dynamic(() => import('@/components/hospital/HospitalMap'), { ssr: false })

export default function HospitalsPage() {
  const { latitude, longitude, error: geoError, loading: geoLoading, getLocation } = useGeolocation()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (latitude && longitude) {
      setLoading(true)
      getNearbyHospitals(latitude, longitude)
        .then(setHospitals)
        .catch(() => setError('Failed to load hospitals'))
        .finally(() => setLoading(false))
    }
  }, [latitude, longitude])

  return (
    <div className="min-h-screen bg-teal-50 dark:bg-gray-900 px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center"
        >
          🏥 Nearby Hospitals
        </motion.h1>

        {!latitude && (
          <div className="flex flex-col items-center gap-4 py-12">
            <MapPin className="w-16 h-16 text-teal-400" />
            <p className="text-gray-600 dark:text-gray-400 text-lg text-center">
              Share your location to find nearby hospitals
            </p>
            <button
              onClick={getLocation}
              disabled={geoLoading}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-full transition-colors disabled:opacity-50"
            >
              {geoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
              {geoLoading ? 'Getting Location...' : 'Get My Location'}
            </button>
            {geoError && <p className="text-red-500 text-sm">{geoError}</p>}
          </div>
        )}

        {latitude && longitude && (
          <>
            <div className="rounded-2xl overflow-hidden shadow-lg mb-6 h-72">
              <HospitalMap
                userLat={latitude}
                userLng={longitude}
                hospitals={hospitals}
              />
            </div>
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
              </div>
            )}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {!loading && <HospitalList hospitals={hospitals} />}
          </>
        )}
      </div>
    </div>
  )
}
