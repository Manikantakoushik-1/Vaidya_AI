'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Phone, MapPin, ArrowLeft } from 'lucide-react'

export default function EmergencyPage() {
  return (
    <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center px-4 text-white">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-md w-full"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-8xl mb-6"
        >
          🚨
        </motion.div>
        <h1 className="text-4xl font-extrabold mb-4">EMERGENCY DETECTED</h1>
        <div className="space-y-2 text-red-100 mb-8 text-lg">
          <p>आपातकालीन स्थिति पाई गई</p>
          <p>అత్యవసర పరిస్థితి కనుగొనబడింది</p>
        </div>

        <motion.a
          href="tel:108"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center gap-4 bg-white text-red-600 font-extrabold text-3xl py-6 px-10 rounded-full shadow-2xl mb-6 w-full"
        >
          <Phone className="w-8 h-8" />
          CALL 108 NOW
        </motion.a>

        <Link
          href="/hospitals"
          className="flex items-center justify-center gap-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xl py-4 px-8 rounded-full mb-8 transition-colors"
        >
          <MapPin className="w-6 h-6" />
          Find Nearest Hospital
        </Link>

        <p className="text-red-100 text-lg font-medium mb-8">
          Stay calm. Help is coming. · शांत रहें। · ప్రశాంతంగా ఉండండి।
        </p>

        <Link
          href="/consultation"
          className="flex items-center justify-center gap-2 text-red-200 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </Link>
      </motion.div>
    </div>
  )
}
