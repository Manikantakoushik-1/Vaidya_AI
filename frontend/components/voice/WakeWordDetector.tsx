'use client'
import { motion } from 'framer-motion'
import { Radio } from 'lucide-react'

interface WakeWordDetectorProps {
  isActive: boolean
  isListening: boolean
  onToggle: () => void
}

export default function WakeWordDetector({ isActive, isListening, onToggle }: WakeWordDetectorProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        isActive
          ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
      }`}
    >
      {isActive && isListening ? (
        <motion.div
          className="w-2 h-2 bg-teal-500 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      ) : (
        <Radio className="w-4 h-4" />
      )}
      <span>
        {isActive ? (isListening ? "Listening for 'Hey Vaidya'..." : 'Wake word active') : 'Enable wake word'}
      </span>
    </button>
  )
}
