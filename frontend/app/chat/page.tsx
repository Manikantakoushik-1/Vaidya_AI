'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, User, AlertTriangle, Radio } from 'lucide-react'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import VoiceVisualizer from '@/components/voice/VoiceVisualizer'
import TalkToInterrupt from '@/components/voice/TalkToInterrupt'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { useWakeWord } from '@/hooks/useWakeWord'
import { useTalkToInterrupt } from '@/hooks/useTalkToInterrupt'
import { BACKEND_URL, type LanguageCode } from '@/lib/constants'
import SeverityBadge from '@/components/medical/SeverityBadge'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  symptoms?: { name: string; severity: string }[]
  severity?: string
  is_emergency?: boolean
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState<LanguageCode>('en')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [voiceMode, setVoiceMode] = useState(true) // Voice mode ON by default for hands-free
  const [handsFreeMode, setHandsFreeMode] = useState(false) // Continuous hands-free conversation
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sendMessageRef = useRef<(text: string) => void>(() => {})

  const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript } = useVoiceRecognition(language)
  const { isSpeaking, speak, stop: stopSpeaking } = useTextToSpeech()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // When transcript is finalized and we're not listening anymore, auto-send in voice mode
  useEffect(() => {
    if (transcript && !isListening) {
      setInput(transcript)
      resetTranscript()
    }
  }, [transcript, isListening, resetTranscript])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          language,
          session_id: sessionId,
        }),
      })

      if (!res.ok) throw new Error('Chat failed')
      const data = await res.json()

      setSessionId(data.session_id)

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.message,
        symptoms: data.symptoms,
        severity: data.severity,
        is_emergency: data.is_emergency,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])

      if (voiceMode) {
        speak(data.message, language)
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, language, sessionId, voiceMode, speak])

  // Keep ref in sync for callbacks
  useEffect(() => { sendMessageRef.current = sendMessage }, [sendMessage])

  // ── Hands-free: Auto-restart mic after AI finishes speaking ──
  useEffect(() => {
    if (handsFreeMode && !isSpeaking && !isLoading && !isListening) {
      const timer = setTimeout(() => {
        resetTranscript()
        startListening((t) => {
          setInput(t)
          sendMessageRef.current(t)
        })
      }, 800) // Small delay after AI stops speaking
      return () => clearTimeout(timer)
    }
  }, [handsFreeMode, isSpeaking, isLoading, isListening, resetTranscript, startListening])

  // ── Wake word: "Hey Vaidya" triggers mic ──
  const handleWakeWord = useCallback(() => {
    resetTranscript()
    startListening((t) => {
      setInput(t)
      sendMessageRef.current(t)
    })
  }, [resetTranscript, startListening])

  const { isActive: isWakeActive, isListening: isWakeListening, activate: activateWake, deactivate: deactivateWake } = useWakeWord(handleWakeWord, language)

  // ── Talk-to-interrupt: speak while AI is talking to interrupt ──
  const handleInterrupt = useCallback((interruptText: string) => {
    stopSpeaking()
    sendMessageRef.current(interruptText)
  }, [stopSpeaking])

  const { startInterruptListening, stopInterruptListening } = useTalkToInterrupt(handleInterrupt, isSpeaking)

  useEffect(() => {
    if (isSpeaking) {
      startInterruptListening(language)
    } else {
      stopInterruptListening()
    }
  }, [isSpeaking, language, startInterruptListening, stopInterruptListening])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const toggleVoice = () => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      startListening((t) => {
        setInput(t)
        sendMessage(t)
      })
    }
  }

  // ── Spacebar shortcut ──
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        toggleVoice()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isListening])

  const welcomeMessages: Record<string, string> = {
    en: "Hello! I'm VaidyaAI, your AI health assistant. Say \"Hey Vaidya\" or tap the mic to start. 🎙️",
    hi: "नमस्ते! मैं VaidyaAI हूँ। \"हे वैद्य\" बोलें या माइक दबाएं। 🎙️",
    te: "నమస్కారం! నేను VaidyaAI. \"హే వైద్య\" అని చెప్పండి లేదా మైక్ నొక్కండి. 🎙️",
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-sm">VaidyaAI Chat</h1>
              <p className="text-xs text-gray-400">
                {isWakeActive ? "🟢 Listening for 'Hey Vaidya'" : handsFreeMode ? '🎙️ Hands-free active' : 'AI Health Assistant'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Wake word toggle */}
            <button
              onClick={() => isWakeActive ? deactivateWake() : activateWake()}
              className={`p-2 rounded-lg transition-colors text-xs font-medium flex items-center gap-1 ${
                isWakeActive
                  ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 border border-teal-300 dark:border-teal-700'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Wake word: Hey Vaidya"
            >
              <Radio className="w-3.5 h-3.5" />
              {isWakeActive && isWakeListening && (
                <motion.div className="w-1.5 h-1.5 bg-teal-500 rounded-full"
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }} />
              )}
            </button>
            {/* Hands-free mode toggle */}
            <button
              onClick={() => {
                setHandsFreeMode(!handsFreeMode)
                if (!voiceMode) setVoiceMode(true) // Auto-enable voice mode
              }}
              className={`p-2 rounded-lg transition-colors ${
                handsFreeMode ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="Continuous hands-free mode"
            >
              {handsFreeMode ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            {/* Voice response toggle */}
            <button
              onClick={() => setVoiceMode(!voiceMode)}
              className={`p-2 rounded-lg transition-colors ${voiceMode ? 'bg-teal-100 text-teal-600' : 'text-gray-400 hover:bg-gray-100'}`}
              title="Toggle voice responses"
            >
              {voiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Welcome message */}
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-teal-600" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md max-w-[80%]">
                <p className="text-gray-700 dark:text-gray-200 text-sm">{welcomeMessages[language]}</p>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-indigo-100 dark:bg-indigo-900/30'
                    : 'bg-teal-100 dark:bg-teal-900/30'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-4 h-4 text-indigo-600" />
                    : <Bot className="w-4 h-4 text-teal-600" />
                  }
                </div>
                <div className={`rounded-2xl px-4 py-3 shadow-md max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-tl-sm'
                }`}>
                  {msg.is_emergency && (
                    <div className="flex items-center gap-1 text-red-500 text-xs font-bold mb-2">
                      <AlertTriangle className="w-3 h-3" /> EMERGENCY
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  {msg.severity && msg.role === 'assistant' && (
                    <div className="mt-2"><SeverityBadge severity={msg.severity} /></div>
                  )}
                  {msg.symptoms && msg.symptoms.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.symptoms.map(s => (
                        <span key={s.name} className="text-xs bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-teal-600" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Talk-to-interrupt indicator */}
      {isSpeaking && (
        <div className="flex justify-center pb-2">
          <TalkToInterrupt />
        </div>
      )}

      {/* Live voice transcript */}
      <AnimatePresence>
        {(isListening && interimTranscript) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-4 pb-2"
          >
            <div className="max-w-3xl mx-auto bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl px-4 py-2 flex items-center gap-3">
              <VoiceVisualizer isActive={true} />
              <p className="text-sm text-teal-700 dark:text-teal-300 italic">
                {interimTranscript}<span className="animate-pulse"> ...</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleVoice}
            className={`relative p-3 rounded-xl transition-colors flex-shrink-0 ${
              isListening
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-teal-50 hover:text-teal-600'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-red-400"
                animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'hi' ? 'अपने लक्षण बताएं...' : language === 'te' ? 'మీ లక్షణాలు చెప్పండి...' : 'Describe your symptoms...'}
            className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="max-w-3xl mx-auto text-center text-xs text-gray-400 mt-2">
          {isWakeActive ? "Say \"Hey Vaidya\" to start" : "Press Space or tap 🎙️ to speak"} · {handsFreeMode ? '🟢 Hands-free ON' : 'Enable 🎙️ for continuous mode'}
        </p>
      </div>
    </div>
  )
}
