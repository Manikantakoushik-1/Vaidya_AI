'use client'
import { useCallback, useRef, useEffect } from 'react'

export function useTalkToInterrupt(onInterrupt: (transcript: string) => void, isEnabled: boolean = true) {
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isEnabledRef = useRef(isEnabled)

  useEffect(() => { isEnabledRef.current = isEnabled }, [isEnabled])

  const startInterruptListening = useCallback((language: string = 'en') => {
    if (typeof window === 'undefined' || !isEnabledRef.current) return
    const SpeechRecognitionAPI = (window as Window & typeof globalThis & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      || (window as Window & typeof globalThis & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return

    const langMap: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' }
    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = langMap[language] || 'en-IN'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.trim()
        if (transcript.split(' ').length >= 2) {
          window.speechSynthesis?.cancel()
          recognition.stop()
          onInterrupt(transcript)
          return
        }
      }
    }
    recognitionRef.current = recognition
    try { recognition.start() } catch { /* ignore */ }
  }, [onInterrupt])

  const stopInterruptListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  useEffect(() => {
    return () => { recognitionRef.current?.stop() }
  }, [])

  return { startInterruptListening, stopInterruptListening }
}
