'use client'
import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VoiceButton from '@/components/voice/VoiceButton'
import WakeWordDetector from '@/components/voice/WakeWordDetector'
import TalkToInterrupt from '@/components/voice/TalkToInterrupt'
import GuidancePanel from '@/components/medical/GuidancePanel'
import SymptomCard from '@/components/medical/SymptomCard'
import SeverityBadge from '@/components/medical/SeverityBadge'
import EmergencyAlert from '@/components/medical/EmergencyAlert'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { useWakeWord } from '@/hooks/useWakeWord'
import { useTalkToInterrupt } from '@/hooks/useTalkToInterrupt'
import { consultWithAI, type ConsultationResponse } from '@/lib/api'
import { detectEmergency } from '@/lib/emergency-keywords'
import { type LanguageCode } from '@/lib/constants'
import { t } from '@/lib/languages'

interface HistoryEntry {
  id: string
  timestamp: string
  transcript: string
  response: ConsultationResponse
  language: string
}

export default function ConsultationPage() {
  const [language, setLanguage] = useState<LanguageCode>('en')
  const [isProcessing, setIsProcessing] = useState(false)
  const [response, setResponse] = useState<ConsultationResponse | null>(null)
  const [showEmergency, setShowEmergency] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript } = useVoiceRecognition(language)
  const { isSpeaking, speak, stop: stopSpeaking } = useTextToSpeech()

  const handleTranscriptResult = useCallback(async (text: string) => {
    if (!text.trim()) return
    setIsProcessing(true)
    setError(null)

    const isEmergency = detectEmergency(text, language)
    if (isEmergency) {
      setShowEmergency(true)
      setIsProcessing(false)
      return
    }

    try {
      const result = await consultWithAI({ text, language })
      setResponse(result)

      if (result.is_emergency) {
        setShowEmergency(true)
      } else {
        speak(result.guidance, language)
      }

      const entry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        transcript: text,
        response: result,
        language,
      }
      const existing = JSON.parse(localStorage.getItem('vaidya_consultations') || '[]')
      localStorage.setItem('vaidya_consultations', JSON.stringify([entry, ...existing].slice(0, 50)))
    } catch {
      setError(t(language, 'common.error'))
    } finally {
      setIsProcessing(false)
    }
  }, [language, speak])

  const handleWakeWord = useCallback(() => {
    startListening(handleTranscriptResult)
  }, [startListening, handleTranscriptResult])

  const { isActive: isWakeActive, activate: activateWake, deactivate: deactivateWake } = useWakeWord(handleWakeWord, language)

  const handleInterrupt = useCallback((interruptTranscript: string) => {
    stopSpeaking()
    handleTranscriptResult(interruptTranscript)
  }, [stopSpeaking, handleTranscriptResult])

  const { startInterruptListening, stopInterruptListening } = useTalkToInterrupt(handleInterrupt, isSpeaking)

  useEffect(() => {
    if (isSpeaking) {
      startInterruptListening(language)
    } else {
      stopInterruptListening()
    }
  }, [isSpeaking, language, startInterruptListening, stopInterruptListening])

  const handleVoiceButtonPress = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      startListening(handleTranscriptResult)
    }
  }, [isListening, startListening, stopListening, resetTranscript, handleTranscriptResult])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        handleVoiceButtonPress()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleVoiceButtonPress])

  const status = isListening ? t(language, 'consultation.listening')
    : isProcessing ? t(language, 'consultation.processing')
    : t(language, 'consultation.tap_to_speak')

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800 px-4 py-6">
      <AnimatePresence>
        {showEmergency && (
          <EmergencyAlert onClose={() => setShowEmergency(false)} language={language} />
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
        <div className="w-full flex justify-end">
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>

        <WakeWordDetector
          isActive={isWakeActive}
          isListening={isWakeActive}
          onToggle={() => isWakeActive ? deactivateWake() : activateWake()}
        />

        <VoiceButton
          isListening={isListening}
          isProcessing={isProcessing}
          onPress={handleVoiceButtonPress}
          status={status}
        />

        <AnimatePresence>
          {(transcript || interimTranscript) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-teal-100 dark:border-gray-700"
            >
              <p className="text-gray-700 dark:text-gray-200 text-lg">
                {transcript || interimTranscript}
                {interimTranscript && <span className="text-gray-400 animate-pulse"> ...</span>}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {isSpeaking && <TalkToInterrupt />}

        {error && (
          <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-center">
            {error}
          </div>
        )}

        <AnimatePresence>
          {response && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <SeverityBadge severity={response.severity} />
              </div>
              {response.symptoms && response.symptoms.length > 0 && (
                <SymptomCard symptoms={response.symptoms} />
              )}
              <GuidancePanel response={response} language={language} />
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs text-gray-400 text-center mt-4">
          {t(language, 'consultation.wake_word_hint')} · Press Space to record
        </p>
      </div>
    </div>
  )
}
