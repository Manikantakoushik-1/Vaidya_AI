'use client'
import { motion } from 'framer-motion'
import { Mic, MicOff, Loader2 } from 'lucide-react'

interface VoiceButtonProps {
  isListening: boolean
  isProcessing: boolean
  onPress: () => void
  status?: string
}

export default function VoiceButton({ isListening, isProcessing, onPress, status }: VoiceButtonProps) {
  const bgColor = isListening ? 'bg-green-500' : isProcessing ? 'bg-amber-500' : 'bg-teal-600'

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {isListening && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-green-400"
              animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-green-400"
              animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
          </>
        )}
        <motion.button
          onClick={onPress}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative w-24 h-24 rounded-full ${bgColor} text-white shadow-2xl flex items-center justify-center transition-colors focus:outline-none focus:ring-4 focus:ring-teal-300`}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isProcessing ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-10 h-10" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </motion.button>
      </div>
      {status && (
        <motion.p
          key={status}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gray-600 dark:text-gray-300 text-base font-medium text-center"
        >
          {status}
        </motion.p>
      )}
    </div>
  )
}
