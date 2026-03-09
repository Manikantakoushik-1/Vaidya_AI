'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Mic, MapPin, Clock, MessageCircle, BarChart3 } from 'lucide-react'

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/consultation', label: 'Consult', icon: Mic },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/hospitals', label: 'Hospitals', icon: MapPin },
  { href: '/history', label: 'History', icon: Clock },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex">
      {tabs.map(tab => {
        const Icon = tab.icon
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-xs font-medium transition-colors relative ${
              isActive
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
            <span>{tab.label}</span>
            {isActive && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-teal-600 dark:bg-teal-400 rounded-t-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
