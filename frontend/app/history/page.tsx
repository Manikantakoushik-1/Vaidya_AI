'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Download, Clock } from 'lucide-react'
import SeverityBadge from '@/components/medical/SeverityBadge'

interface HistoryEntry {
  id: string
  timestamp: string
  transcript: string
  response: {
    guidance: string
    severity: string
    symptoms: { name: string; severity: string }[]
  }
  language: string
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const stored = localStorage.getItem('vaidya_consultations')
    if (stored) setEntries(JSON.parse(stored))
  }, [])

  const filtered = filter === 'all' ? entries : entries.filter(e => e.response.severity === filter)

  const clearHistory = () => {
    localStorage.removeItem('vaidya_consultations')
    setEntries([])
  }

  const exportHistory = () => {
    const text = entries.map(e =>
      `[${new Date(e.timestamp).toLocaleString()}] (${e.language})\nYou: ${e.transcript}\nVaidya: ${e.response.guidance}\nSeverity: ${e.response.severity}\n`
    ).join('\n---\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vaidya_history.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-teal-50 dark:bg-gray-900 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📋 Consultation History</h1>
          <div className="flex gap-2">
            <button
              onClick={exportHistory}
              className="flex items-center gap-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={clearHistory}
              className="flex items-center gap-1 text-sm bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'mild', 'moderate', 'severe', 'emergency'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-teal-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No consultations yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {filtered.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      {new Date(entry.timestamp).toLocaleString()}
                      <span className="uppercase text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{entry.language}</span>
                    </div>
                    <SeverityBadge severity={entry.response.severity} />
                  </div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    <span className="text-gray-400 text-sm">You: </span>{entry.transcript}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                    {entry.response.guidance}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
