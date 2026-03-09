'use client'
import { motion } from 'framer-motion'
import { Phone, X } from 'lucide-react'
import { type LanguageCode } from '@/lib/constants'

interface EmergencyAlertProps {
  onClose: () => void
  language?: LanguageCode
}

export default function EmergencyAlert({ onClose, language = 'en' }: EmergencyAlertProps) {
  void language
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-red-600 flex flex-col items-center justify-center p-6"
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
        <X className="w-8 h-8" />
      </button>

      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="text-8xl mb-6"
      >
        🚨
      </motion.div>

      <h1 className="text-3xl font-extrabold text-white mb-2 text-center">EMERGENCY DETECTED</h1>
      <p className="text-red-100 text-lg mb-8 text-center">
        आपातकालीन स्थिति · అత్యవసర పరిస్థితి
      </p>

      <motion.a
        href="tel:108"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-4 bg-white text-red-600 font-extrabold text-3xl py-6 px-12 rounded-full shadow-2xl mb-4"
      >
        <Phone className="w-8 h-8" />
        CALL 108
      </motion.a>

      <p className="text-red-100 text-center mt-4">
        Stay calm · शांत रहें · ప్రశాంతంగా ఉండండి
      </p>
    </motion.div>
  )
}
