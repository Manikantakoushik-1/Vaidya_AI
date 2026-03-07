'use client'
import { useState, useCallback, useRef } from 'react'

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((text: string, lang: string = 'en-IN') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const langMap: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = langMap[lang] || 'en-IN'
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 1.0
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  return { isSpeaking, speak, stop }
}
