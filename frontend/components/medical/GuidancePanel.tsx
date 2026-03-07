'use client'
import { motion } from 'framer-motion'
import { type ConsultationResponse } from '@/lib/api'
import { type LanguageCode } from '@/lib/constants'
import { Home, Clock, Volume2 } from 'lucide-react'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'

interface GuidancePanelProps {
  response: ConsultationResponse
  language?: LanguageCode
}

export default function GuidancePanel({ response, language = 'en' }: GuidancePanelProps) {
  const { isSpeaking, speak, stop } = useTextToSpeech()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-teal-50 dark:bg-teal-900/20">
        <h3 className="font-bold text-teal-800 dark:text-teal-300 text-lg">🩺 VaidyaAI Guidance</h3>
        <button
          onClick={() => isSpeaking ? stop() : speak(response.guidance, language)}
          className="flex items-center gap-1.5 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-200 transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          {isSpeaking ? 'Stop' : 'Listen'}
        </button>
      </div>

      <div className="p-5">
        <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-base">{response.guidance}</p>

        {response.home_remedies && response.home_remedies.length > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold mb-3">
              <Home className="w-5 h-5" />
              Home Remedies
            </div>
            <ul className="space-y-2">
              {response.home_remedies.map((remedy, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                  {remedy}
                </li>
              ))}
            </ul>
          </div>
        )}

        {response.when_to_seek_help && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold mb-2">
              <Clock className="w-5 h-5" />
              When to Seek Help
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{response.when_to_seek_help}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
