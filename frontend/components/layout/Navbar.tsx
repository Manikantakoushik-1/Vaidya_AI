'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Moon, Sun, BarChart3 } from 'lucide-react'
import { useState, useEffect } from 'react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/consultation', label: 'Consult' },
  { href: '/chat', label: 'Chat' },
  { href: '/hospitals', label: 'Hospitals' },
  { href: '/history', label: 'History' },
  { href: '/reminders', label: 'Reminders' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/about', label: 'About' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 h-16 items-center px-6 gap-6">
      <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-teal-600 dark:text-teal-400 mr-4">
        🩺 VaidyaAI
      </Link>
      <div className="flex items-center gap-1 flex-1">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === link.href
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-gray-800 hover:text-teal-600 dark:hover:text-teal-400'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <button
        onClick={() => setDark(!dark)}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle dark mode"
      >
        {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </nav>
  )
}
