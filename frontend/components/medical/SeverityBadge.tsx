import { ElementType } from 'react'
import { AlertCircle, AlertTriangle, Info, Siren } from 'lucide-react'

interface SeverityBadgeProps {
  severity: string
}

const config: Record<string, { label: string; icon: ElementType; className: string }> = {
  mild: { label: 'Mild', icon: Info, className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  moderate: { label: 'Moderate', icon: AlertTriangle, className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  severe: { label: 'Severe', icon: AlertCircle, className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  emergency: { label: 'EMERGENCY', icon: Siren, className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-bold' },
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const s = severity?.toLowerCase() || 'mild'
  const c = config[s] || config.mild
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${c.className}`}>
      <Icon className="w-4 h-4" />
      {c.label}
    </span>
  )
}
