'use client'
import { motion } from 'framer-motion'

interface VoiceVisualizerProps {
  isActive: boolean
}

export default function VoiceVisualizer({ isActive }: VoiceVisualizerProps) {
  return (
    <div className="flex items-end gap-1 h-8">
      {[0, 1, 2, 3, 4].map(i => (
        <motion.div
          key={i}
          className="w-1.5 bg-teal-500 rounded-full"
          animate={isActive ? {
            scaleY: [0.3, 1.5, 0.3],
            opacity: [0.7, 1, 0.7],
          } : { scaleY: 0.3, opacity: 0.3 }}
          transition={isActive ? {
            duration: 0.6 + i * 0.1,
            repeat: Infinity,
            delay: i * 0.15,
          } : {}}
          style={{ height: '100%', transformOrigin: 'bottom' }}
        />
      ))}
    </div>
  )
}
