'use client'
import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { BACKEND_URL } from '@/lib/constants'

interface DownloadReportProps {
  guidance: string
  symptoms: { name: string; severity: string }[]
  severity: string
  language: string
  patientText?: string
  homeRemedies?: string[]
  whenToSeekHelp?: string
}

export default function DownloadReport({
  guidance, symptoms, severity, language, patientText, homeRemedies, whenToSeekHelp
}: DownloadReportProps) {
  const [loading, setLoading] = useState(false)

  const download = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/report/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guidance,
          symptoms,
          severity,
          language,
          patient_text: patientText || '',
          home_remedies: homeRemedies || [],
          when_to_seek_help: whenToSeekHelp || '',
        }),
      })
      if (!res.ok) throw new Error('PDF generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'VaidyaAI_Health_Report.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to generate PDF report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={download}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/50 disabled:opacity-50 transition-colors"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      Download Report
    </button>
  )
}
