'use client'
interface SymptomInfo { name: string; severity: string }

interface SymptomCardProps {
  symptoms: SymptomInfo[]
}

const severityColors: Record<string, string> = {
  mild: 'bg-green-100 text-green-700 border-green-200',
  moderate: 'bg-amber-100 text-amber-700 border-amber-200',
  severe: 'bg-orange-100 text-orange-700 border-orange-200',
  emergency: 'bg-red-100 text-red-700 border-red-200',
}

export default function SymptomCard({ symptoms }: SymptomCardProps) {
  if (!symptoms || symptoms.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {symptoms.map((symptom, i) => (
        <span
          key={i}
          className={`px-3 py-1 rounded-full text-sm font-medium border ${severityColors[symptom.severity] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
        >
          {symptom.name}
        </span>
      ))}
    </div>
  )
}
