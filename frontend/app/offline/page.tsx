'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { WifiOff, Clock, RefreshCw } from 'lucide-react'

interface CachedEntry {
  id: string
  timestamp: string
  transcript: string
  response: { guidance: string; severity: string; symptoms: { name: string; severity: string }[] }
  language: string
}

export default function OfflinePage() {
  const [entries, setEntries] = useState<CachedEntry[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('vaidya_consultations')
    if (stored) setEntries(JSON.parse(stored).slice(0, 10))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <WifiOff className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">You&apos;re Offline</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Don&apos;t worry — your cached consultation history is available below.
            <br />We&apos;ll reconnect automatically when your network is back.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors mb-8"
          >
            <RefreshCw className="w-4 h-4" /> Try Reconnecting
          </button>
        </motion.div>

        {entries.length > 0 && (
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📋 Cached Consultations</h2>
            <div className="space-y-4">
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-1">
                    <span className="text-gray-400">You:</span> {entry.transcript}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                    {entry.response.guidance}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <h3 className="font-bold text-blue-700 dark:text-blue-300 mb-2">💡 Emergency Tip</h3>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            In a medical emergency, call <strong>108</strong> immediately. This works even without internet.
          </p>
        </div>
      </div>
    </div>
  )
}
