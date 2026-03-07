'use client'
import { motion } from 'framer-motion'

const steps = [
  { title: 'Speak', desc: 'Tell your symptoms in your language' },
  { title: 'AI Analysis', desc: 'AI processes and understands your condition' },
  { title: 'Guidance', desc: 'Get health guidance and home remedies' },
  { title: 'Hospital', desc: 'Get directed to nearest hospital if needed' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-teal-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 mb-2 text-center">About VaidyaAI</h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">AI Doctor for Rural India</p>
        </motion.div>

        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">What is VaidyaAI?</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            VaidyaAI is a voice-first AI health assistant designed specifically for rural India.
            It allows users to speak about their symptoms in Telugu, Hindi, or English and receive
            health guidance, home remedies, and emergency alerts — completely free.
          </p>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
          <div className="flex flex-col gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400 rounded-full font-bold text-lg flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{step.title}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Technology</h2>
          <div className="flex flex-wrap gap-2">
            {['Next.js 14', 'FastAPI', 'Google Gemini AI', 'Web Speech API', 'Leaflet Maps', 'TailwindCSS'].map(tech => (
              <span key={tech} className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-full text-sm font-medium">
                {tech}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-amber-800 dark:text-amber-400 mb-2">⚠️ Medical Disclaimer</h2>
          <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
            VaidyaAI provides general health information only, not medical advice.
            It is NOT a substitute for professional medical diagnosis or treatment.
            Always consult a qualified healthcare professional for medical advice.
            In emergencies, call 108 immediately.
          </p>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Free &amp; Open Source</h2>
          <p className="text-gray-600 dark:text-gray-400">
            VaidyaAI is completely free to use and open source. Built with ❤️ for the 600M+ rural Indians
            who deserve access to quality health information.
          </p>
        </section>
      </div>
    </div>
  )
}
