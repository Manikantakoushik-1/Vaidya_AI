'use client'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { WifiOff, Wifi } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-2 text-sm font-medium flex items-center justify-center gap-2"
        >
          <WifiOff className="w-4 h-4" />
          You&apos;re offline — cached data is being shown
        </motion.div>
      )}
      {isOnline && wasOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white text-center py-2 text-sm font-medium flex items-center justify-center gap-2"
        >
          <Wifi className="w-4 h-4" />
          Back online!
        </motion.div>
      )}
    </AnimatePresence>
  )
}
