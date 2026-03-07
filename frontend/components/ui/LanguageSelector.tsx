'use client'
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/constants'

interface LanguageSelectorProps {
  value: LanguageCode
  onChange: (lang: LanguageCode) => void
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="flex gap-2">
      {SUPPORTED_LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code as LanguageCode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            value === lang.code
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-teal-50 dark:hover:bg-gray-700'
          }`}
        >
          <span>{lang.flag}</span>
          <span className="hidden sm:inline">{lang.nativeName}</span>
          <span className="sm:hidden">{lang.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  )
}
