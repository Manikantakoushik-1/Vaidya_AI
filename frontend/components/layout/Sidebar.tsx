'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Mic, MapPin, Clock, Info } from 'lucide-react'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { useState } from 'react'
import { type LanguageCode } from '@/lib/constants'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/consultation', label: 'Consult', icon: Mic },
  { href: '/hospitals', label: 'Hospitals', icon: MapPin },
  { href: '/history', label: 'History', icon: Clock },
  { href: '/about', label: 'About', icon: Info },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [language, setLanguage] = useState<LanguageCode>('en')

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen fixed left-0 top-0 z-30 p-6">
      <Link href="/" className="flex items-center gap-2 font-extrabold text-2xl text-teal-600 dark:text-teal-400 mb-8">
        🩺 VaidyaAI
      </Link>
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-gray-800 hover:text-teal-600 dark:hover:text-teal-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-400 mb-3">Language</p>
        <LanguageSelector value={language} onChange={setLanguage} />
      </div>
    </aside>
  )
}
