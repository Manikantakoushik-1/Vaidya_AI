'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler as EventListener)
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShow(false)
  }

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 border border-teal-200 dark:border-gray-700"
      >
        <button onClick={() => setShow(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
            <Download className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Install VaidyaAI</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Use offline even without internet</p>
            <button
              onClick={handleInstall}
              className="mt-2 px-4 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors"
            >
              Install App
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
