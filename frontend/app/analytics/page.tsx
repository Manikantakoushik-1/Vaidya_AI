'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Activity, Globe, AlertTriangle, Users, Clock, TrendingUp, Zap } from 'lucide-react'
import { BACKEND_URL } from '@/lib/constants'

interface AnalyticsSummary {
  total_consultations: number
  consultations_today: number
  consultations_week: number
  consultations_month: number
  top_symptoms: { name: string; count: number }[]
  severity_distribution: { mild: number; moderate: number; severe: number; emergency: number }
  language_distribution: { en: number; hi: number; te: number }
  emergency_alerts: number
  avg_symptoms_per_consultation: number
  peak_hours: { hour: number; count: number }[]
  consultations_over_time: { date: string; count: number }[]
  total_emergency_checks: number
}

/* ——— Animated counter ——— */
function AnimatedCounter({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (value === 0) { setDisplay(0); return }
    const steps = 40
    const increment = value / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= value) { setDisplay(value); clearInterval(interval) }
      else setDisplay(Math.round(current))
    }, (duration * 1000) / steps)
    return () => clearInterval(interval)
  }, [value, duration])
  return <>{display}</>
}

/* ——— Stat Card ——— */
function StatCard({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: number; color: string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
        <AnimatedCounter value={value} />
      </div>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </motion.div>
  )
}

/* ——— CSS Bar Chart ——— */
function BarChartCSS({ data }: { data: { name: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <motion.div key={item.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[60%]">{item.name}</span>
            <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{item.count}</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.count / max) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
              className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full"
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ——— CSS Donut Chart ——— */
function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  let cumulative = 0
  const segments = data.map(d => {
    const start = (cumulative / total) * 360
    cumulative += d.value
    const end = (cumulative / total) * 360
    return { ...d, start, end }
  })

  const conicGradient = segments.length > 0 && total > 0
    ? segments.map(s => `${s.color} ${s.start}deg ${s.end}deg`).join(', ')
    : '#e5e7eb 0deg 360deg'

  return (
    <div className="flex items-center gap-6">
      <div
        className="w-36 h-36 rounded-full flex-shrink-0 relative"
        style={{ background: `conic-gradient(${conicGradient})` }}
      >
        <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
          <span className="text-lg font-bold text-gray-700 dark:text-gray-200">{total > 1 ? total : 0}</span>
        </div>
      </div>
      <div className="space-y-2">
        {data.map(d => (
          <div key={d.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-sm text-gray-600 dark:text-gray-400">{d.label}: <strong>{d.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ——— CSS Line Chart ——— */
function LineChart({ data }: { data: { date: string; count: number }[] }) {
  if (data.length === 0) return <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
  const max = Math.max(...data.map(d => d.count), 1)
  const h = 160
  const w = 100 // percentage
  const points = data.map((d, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * w,
    y: h - (d.count / max) * (h - 20),
    ...d,
  }))
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h + 10}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D9488" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#lineGrad)" />
      <path d={pathD} fill="none" stroke="#0D9488" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill="#0D9488" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  )
}

/* ——— Main Page ——— */
export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/analytics/summary`)
      if (res.ok) setData(await res.json())
    } catch { /* offline — keep stale data */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30_000) // auto-refresh 30s
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50 dark:bg-gray-900">
      <div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full" />
    </div>
  )

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50 dark:bg-gray-900 text-gray-500">
      Failed to load analytics.
    </div>
  )

  const severityData = [
    { label: 'Mild', value: data.severity_distribution.mild, color: '#16A34A' },
    { label: 'Moderate', value: data.severity_distribution.moderate, color: '#D97706' },
    { label: 'Severe', value: data.severity_distribution.severe, color: '#EA580C' },
    { label: 'Emergency', value: data.severity_distribution.emergency, color: '#DC2626' },
  ]

  const langNames: Record<string, string> = { en: 'English', hi: 'Hindi', te: 'Telugu' }
  const langColors: Record<string, string> = { en: '#6366F1', hi: '#0D9488', te: '#D97706' }
  const langData = Object.entries(data.language_distribution).map(([code, count]) => ({
    label: langNames[code] || code,
    value: count,
    color: langColors[code] || '#94A3B8',
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-teal-600" /> Analytics Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Auto-refreshes every 30 seconds</p>
        </motion.div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Total Consultations" value={data.total_consultations} color="bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" />
          <StatCard icon={Activity} label="Today" value={data.consultations_today} color="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" sub={`Week: ${data.consultations_week} · Month: ${data.consultations_month}`} />
          <StatCard icon={AlertTriangle} label="Emergency Alerts" value={data.emergency_alerts} color="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" />
          <StatCard icon={Zap} label="Avg Symptoms" value={data.avg_symptoms_per_consultation} color="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" sub="per consultation" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Symptoms */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-500" /> Top Symptoms
            </h2>
            {data.top_symptoms.length > 0
              ? <BarChartCSS data={data.top_symptoms} />
              : <p className="text-gray-400 text-sm text-center py-8">No symptoms recorded yet</p>
            }
          </motion.div>

          {/* Severity Distribution */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" /> Severity Distribution
            </h2>
            <DonutChart data={severityData} />
          </motion.div>

          {/* Consultations Over Time */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Consultations Over Time
            </h2>
            <LineChart data={data.consultations_over_time} />
          </motion.div>

          {/* Language Usage */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-500" /> Language Usage
            </h2>
            <DonutChart data={langData} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
