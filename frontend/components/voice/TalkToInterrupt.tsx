'use client'
import { motion } from 'framer-motion'

export default function TalkToInterrupt() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-full px-4 py-2"
    >
      <span className="text-lg">🗣️</span>
      <span className="text-sm text-teal-700 dark:text-teal-300 font-medium">Speaking — tap mic or talk to interrupt</span>
      <div className="flex items-end gap-0.5 h-5">
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            className="w-1 bg-teal-500 rounded-full"
            animate={{ scaleY: [0.4, 1.2, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
            style={{ height: '100%', transformOrigin: 'bottom' }}
          />
        ))}
      </div>
    </motion.div>
  )
}
