export const APP_NAME = 'VaidyaAI'
export const APP_TAGLINE = 'AI Doctor for Rural India'
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
export const EMERGENCY_NUMBER = '108'
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिंदी' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳', nativeName: 'తెలుగు' },
] as const
export type LanguageCode = 'en' | 'hi' | 'te'
export const WAKE_WORDS = {
  en: ['hey vaidya', 'ok vaidya', 'hello vaidya'],
  hi: ['हे वैद्य', 'हैलो वैद्य'],
  te: ['హే వైద్య', 'హలో వైద్య'],
}
export const SEVERITY_COLORS = {
  mild: 'success',
  moderate: 'warning',
  severe: 'orange-600',
  emergency: 'emergency',
} as const
