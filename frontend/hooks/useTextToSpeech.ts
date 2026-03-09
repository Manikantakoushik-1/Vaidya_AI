'use client'
import { useState, useCallback, useRef } from 'react'
import { BACKEND_URL } from '@/lib/constants'

/**
 * Text-to-Speech hook with automatic fallback:
 * 1. Try browser SpeechSynthesis (fast, offline)
 * 2. If no voice available for the language → fall back to backend gTTS
 */
export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const langMap: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' }

  /**
   * Check if the browser has a voice for the given language.
   * Chrome/Edge on Windows typically have en-IN, hi-IN, but NOT te-IN.
   */
  const hasBrowserVoice = useCallback((lang: string): boolean => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return false
    const voices = window.speechSynthesis.getVoices()
    const targetLang = langMap[lang] || lang
    // Check for exact match or partial (e.g., "te" matches "te-IN")
    return voices.some(v =>
      v.lang === targetLang ||
      v.lang.startsWith(lang) ||
      v.lang.toLowerCase().startsWith(lang.toLowerCase())
    )
  }, [])

  /**
   * Speak text using the browser's built-in SpeechSynthesis.
   */
  const speakBrowser = useCallback((text: string, lang: string): boolean => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return false

    const voices = window.speechSynthesis.getVoices()
    const targetLang = langMap[lang] || 'en-IN'
    const voice = voices.find(v => v.lang === targetLang) ||
                  voices.find(v => v.lang.startsWith(lang))

    if (!voice) return false // No suitable voice found

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = voice
    utterance.lang = targetLang
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 1.0
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
    return true
  }, [])

  /**
   * Speak text using the backend TTS API (gTTS / Sarvam AI).
   * Works for all languages including Telugu.
   */
  const speakBackend = useCallback(async (text: string, lang: string) => {
    try {
      setIsSpeaking(true)
      abortRef.current = new AbortController()

      const response = await fetch(`${BACKEND_URL}/api/tts/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.substring(0, 2000), language: lang }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        setIsSpeaking(false)
        return
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio

      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(url)
      }
      audio.onerror = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(url)
      }
      await audio.play()
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.warn('Backend TTS failed:', err)
      }
      setIsSpeaking(false)
    }
  }, [])

  /**
   * Main speak function:
   * - For English: use browser TTS (usually available)
   * - For Hindi/Telugu: try browser first, fall back to backend gTTS
   */
  const speak = useCallback((text: string, lang: string = 'en') => {
    if (!text) return

    // Try browser voices first (instant, no network needed)
    const browserWorked = speakBrowser(text, lang)
    if (browserWorked) return

    // Fall back to backend TTS for languages without browser voices
    speakBackend(text, lang)
  }, [speakBrowser, speakBackend])

  const stop = useCallback(() => {
    // Stop browser TTS
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    // Stop backend audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    // Abort pending fetch
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setIsSpeaking(false)
  }, [])

  return { isSpeaking, speak, stop }
}
