import { clsx } from 'clsx'

interface BadgeProps {
  variant?: 'mild' | 'moderate' | 'severe' | 'emergency' | 'default'
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    mild: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    severe: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    emergency: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
