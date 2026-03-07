import HospitalCard from './HospitalCard'
import { type Hospital } from '@/lib/api'

interface HospitalListProps {
  hospitals: Hospital[]
}

export default function HospitalList({ hospitals }: HospitalListProps) {
  if (hospitals.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No hospitals found nearby.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
        {hospitals.length} Hospital{hospitals.length !== 1 ? 's' : ''} Found
      </h2>
      {hospitals.map(hospital => (
        <HospitalCard key={hospital.id} hospital={hospital} />
      ))}
    </div>
  )
}
