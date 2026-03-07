export const EMERGENCY_KEYWORDS = {
  en: ['chest pain', "can't breathe", 'unconscious', 'heavy bleeding', 'heart attack', 'stroke', 'poisoning', 'snake bite', 'seizure', 'severe accident', 'not breathing', 'fainted'],
  hi: ['सीने में दर्द', 'सांस नहीं', 'बेहोश', 'बहुत खून', 'दिल का दौरा', 'लकवा', 'जहर', 'सांप का काटना', 'दौरा', 'गंभीर दुर्घटना'],
  te: ['ఛాతీ నొప్పి', 'ఊపిరి ఆడటం లేదు', 'స్పృహ లేదు', 'అధిక రక్తస్రావం', 'గుండెపోటు', 'పక్షవాతం', 'విషం', 'పాము కాటు', 'మూర్ఛ', 'తీవ్ర ప్రమాదం'],
}

export function detectEmergency(text: string, language: string = 'en'): boolean {
  const lowerText = text.toLowerCase()
  const keywords = [
    ...EMERGENCY_KEYWORDS.en,
    ...(EMERGENCY_KEYWORDS[language as keyof typeof EMERGENCY_KEYWORDS] || []),
  ]
  return keywords.some(kw => lowerText.includes(kw.toLowerCase()))
}
