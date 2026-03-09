'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { BACKEND_URL } from '@/lib/constants'

interface ImageUploadProps {
  language: string
  onResult: (analysis: string) => void
}

export default function ImageUpload({ language, onResult }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const analyze = async () => {
    if (!file) return
    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('text', description)
      formData.append('language', language)

      const res = await fetch(`${BACKEND_URL}/api/consultation/image`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      onResult(data.analysis)
      setIsOpen(false)
      reset()
    } catch {
      onResult('Image analysis failed. Please try again or consult a doctor.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const reset = () => {
    setPreview(null)
    setFile(null)
    setDescription('')
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
      >
        <Camera className="w-4 h-4" /> Photo Symptom
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
            onClick={() => { setIsOpen(false); reset() }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-indigo-500" /> Image Analysis
                </h2>
                <button onClick={() => { setIsOpen(false); reset() }} className="text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!preview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-teal-400 transition-colors"
                >
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Tap to take a photo or upload</p>
                  <p className="text-xs text-gray-400 mt-1">Supports JPEG, PNG, WEBP</p>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img src={preview} alt="Preview" className="w-full rounded-xl max-h-64 object-cover" />
                    <button onClick={reset}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe what you see (optional)"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <button onClick={analyze} disabled={isAnalyzing}
                    className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : 'Analyze Image'}
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-3 text-center">
                Images are analyzed by AI. Always consult a doctor for diagnosis.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
