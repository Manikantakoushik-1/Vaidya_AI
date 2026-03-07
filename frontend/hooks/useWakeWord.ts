'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { WAKE_WORDS } from '@/lib/constants'

export function useWakeWord(onWakeWordDetected: () => void, language: string = 'en') {
  const [isActive, setIsActive] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isActiveRef = useRef(false)

  const langMap: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' }

  const allWakeWords = [
    ...WAKE_WORDS.en,
    ...WAKE_WORDS.hi,
    ...WAKE_WORDS.te,
  ]

  const startWakeWordListening = useCallback(() => {
    if (typeof window === 'undefined') return
    const SpeechRecognitionAPI = (window as Window & typeof globalThis & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      || (window as Window & typeof globalThis & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition
    if (!SpeechRecognitionAPI || !isActiveRef.current) return

    try {
      const recognition = new SpeechRecognitionAPI()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = langMap[language] || 'en-IN'

      recognition.onstart = () => setIsListening(true)
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.toLowerCase().trim()
          const detected = allWakeWords.some(ww => transcript.includes(ww.toLowerCase()))
          if (detected) {
            recognition.stop()
            onWakeWordDetected()
            return
          }
        }
      }
      recognition.onerror = () => {
        setIsListening(false)
        if (isActiveRef.current) {
          restartTimerRef.current = setTimeout(startWakeWordListening, 1000)
        }
      }
      recognition.onend = () => {
        setIsListening(false)
        if (isActiveRef.current) {
          restartTimerRef.current = setTimeout(startWakeWordListening, 500)
        }
      }
      recognitionRef.current = recognition
      recognition.start()
    } catch {
      if (isActiveRef.current) {
        restartTimerRef.current = setTimeout(startWakeWordListening, 2000)
      }
    }
  }, [language, onWakeWordDetected])

  const activate = useCallback(() => {
    isActiveRef.current = true
    setIsActive(true)
    startWakeWordListening()
  }, [startWakeWordListening])

  const deactivate = useCallback(() => {
    isActiveRef.current = false
    setIsActive(false)
    setIsListening(false)
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
    recognitionRef.current?.stop()
  }, [])

  useEffect(() => {
    return () => {
      isActiveRef.current = false
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
      recognitionRef.current?.stop()
    }
  }, [])

  return { isActive, isListening, activate, deactivate }
}
