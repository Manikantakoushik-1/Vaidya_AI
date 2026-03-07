'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mic, Globe, AlertTriangle, Heart } from 'lucide-react'

const features = [
  { icon: Mic, title: 'Voice-First', desc: 'Speak in your language — no typing needed', color: 'bg-teal-50 text-teal-600' },
  { icon: Globe, title: 'Multilingual', desc: 'Telugu, Hindi, and English support', color: 'bg-indigo-50 text-indigo-600' },
  { icon: AlertTriangle, title: 'Emergency Ready', desc: 'Instant 108 alerts for critical conditions', color: 'bg-red-50 text-red-600' },
  { icon: Heart, title: 'Free Forever', desc: 'No charges, no subscription, always free', color: 'bg-green-50 text-green-600' },
]

const stats = [
  { value: '600M+', label: 'Rural Indians' },
  { value: '3', label: 'Languages' },
  { value: 'Free', label: 'Always' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="flex flex-col items-center justify-center px-4 pt-16 pb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-7xl mb-4">🩺</div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-teal-600 dark:text-teal-400 mb-3">
            VaidyaAI
          </h1>
          <p className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            AI Doctor for Rural India
          </p>
          <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <span>ग्रामीण भारत के लिए AI डॉक्टर</span>
            <span>గ్రామీణ భారతదేశం కోసం AI వైద్యుడు</span>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/consultation"
              className="inline-flex items-center gap-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xl px-10 py-5 rounded-full shadow-lg transition-colors"
            >
              <Mic className="w-6 h-6" />
              Start Consultation
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="px-4 pb-10">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-md"
            >
              <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md flex items-start gap-4"
            >
              <div className={`p-3 rounded-xl ${f.color}`}>
                <f.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
