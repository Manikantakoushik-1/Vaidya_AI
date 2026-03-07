'use client'
import { useState, useCallback, useRef } from 'react'

interface VoiceRecognitionState {
  isListening: boolean
  transcript: string
  interimTranscript: string
  error: string | null
  isSupported: boolean
}

export function useVoiceRecognition(language: string = 'en') {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false, transcript: '', interimTranscript: '', error: null,
    isSupported: typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
  })
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const onResultCallbackRef = useRef<((transcript: string) => void) | null>(null)

  const langMap: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' }

  const startListening = useCallback((onResult?: (transcript: string) => void) => {
    if (typeof window === 'undefined') return
    const SpeechRecognitionAPI = (window as Window & typeof globalThis & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      || (window as Window & typeof globalThis & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      setState(s => ({ ...s, error: 'Speech recognition not supported' }))
      return
    }
    if (onResult) onResultCallbackRef.current = onResult
    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = langMap[language] || 'en-IN'
    recognition.onstart = () => setState(s => ({ ...s, isListening: true, error: null }))
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t
        else interim += t
      }
      setState(s => ({ ...s, transcript: final || s.transcript, interimTranscript: interim }))
      if (final && onResultCallbackRef.current) onResultCallbackRef.current(final)
    }
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setState(s => ({ ...s, error: event.error, isListening: false }))
    }
    recognition.onend = () => setState(s => ({ ...s, isListening: false, interimTranscript: '' }))
    recognitionRef.current = recognition
    recognition.start()
  }, [language])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setState(s => ({ ...s, isListening: false }))
  }, [])

  const resetTranscript = useCallback(() => {
    setState(s => ({ ...s, transcript: '', interimTranscript: '' }))
  }, [])

  return { ...state, startListening, stopListening, resetTranscript }
}
