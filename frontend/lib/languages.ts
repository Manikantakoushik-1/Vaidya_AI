export type LanguageCode = 'en' | 'hi' | 'te'

interface Translations {
  navigation: {
    home: string
    consult: string
    hospitals: string
    history: string
    about: string
  }
  consultation: {
    start_listening: string
    listening: string
    processing: string
    speak_now: string
    tap_to_speak: string
    wake_word_hint: string
  }
  emergency: {
    emergency_detected: string
    call_108: string
    go_to_hospital: string
    stay_calm: string
  }
  common: {
    loading: string
    error: string
    disclaimer: string
    try_again: string
    close: string
    back: string
  }
  hospital: {
    nearby_hospitals: string
    get_directions: string
    distance: string
    get_location: string
    no_hospitals: string
  }
  history: {
    consultation_history: string
    clear_history: string
    no_history: string
    export: string
  }
  severity: {
    mild: string
    moderate: string
    severe: string
    emergency: string
  }
}

const translations: Record<LanguageCode, Translations> = {
  en: {
    navigation: {
      home: 'Home',
      consult: 'Consult',
      hospitals: 'Hospitals',
      history: 'History',
      about: 'About',
    },
    consultation: {
      start_listening: 'Start Listening',
      listening: 'Listening...',
      processing: 'Processing...',
      speak_now: 'Speak Now',
      tap_to_speak: 'Tap to Speak',
      wake_word_hint: "Say 'Hey Vaidya' to start",
    },
    emergency: {
      emergency_detected: '🚨 EMERGENCY DETECTED',
      call_108: 'CALL 108 NOW',
      go_to_hospital: 'Go to Nearest Hospital',
      stay_calm: 'Stay calm. Help is coming.',
    },
    common: {
      loading: 'Loading...',
      error: 'Something went wrong. Please try again.',
      disclaimer: 'VaidyaAI provides general health information only, not medical advice. Always consult a qualified doctor.',
      try_again: 'Try Again',
      close: 'Close',
      back: 'Go Back',
    },
    hospital: {
      nearby_hospitals: 'Nearby Hospitals',
      get_directions: 'Get Directions',
      distance: 'km away',
      get_location: 'Get My Location',
      no_hospitals: 'No hospitals found nearby.',
    },
    history: {
      consultation_history: 'Consultation History',
      clear_history: 'Clear History',
      no_history: 'No consultations yet.',
      export: 'Export',
    },
    severity: {
      mild: 'Mild',
      moderate: 'Moderate',
      severe: 'Severe',
      emergency: 'Emergency',
    },
  },
  hi: {
    navigation: {
      home: 'होम',
      consult: 'परामर्श',
      hospitals: 'अस्पताल',
      history: 'इतिहास',
      about: 'बारे में',
    },
    consultation: {
      start_listening: 'सुनना शुरू करें',
      listening: 'सुन रहे हैं...',
      processing: 'प्रक्रिया हो रही है...',
      speak_now: 'अभी बोलें',
      tap_to_speak: 'बोलने के लिए टैप करें',
      wake_word_hint: "'हे वैद्य' कहें",
    },
    emergency: {
      emergency_detected: '🚨 आपातकाल पाया गया',
      call_108: 'अभी 108 पर कॉल करें',
      go_to_hospital: 'निकटतम अस्पताल जाएं',
      stay_calm: 'शांत रहें। मदद आ रही है।',
    },
    common: {
      loading: 'लोड हो रहा है...',
      error: 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।',
      disclaimer: 'वैद्य AI केवल सामान्य स्वास्थ्य जानकारी प्रदान करता है। हमेशा योग्य डॉक्टर से परामर्श लें।',
      try_again: 'पुनः प्रयास करें',
      close: 'बंद करें',
      back: 'वापस जाएं',
    },
    hospital: {
      nearby_hospitals: 'नजदीकी अस्पताल',
      get_directions: 'दिशा पाएं',
      distance: 'किमी दूर',
      get_location: 'मेरी लोकेशन पाएं',
      no_hospitals: 'नजदीक कोई अस्पताल नहीं मिला।',
    },
    history: {
      consultation_history: 'परामर्श इतिहास',
      clear_history: 'इतिहास साफ करें',
      no_history: 'अभी तक कोई परामर्श नहीं।',
      export: 'निर्यात करें',
    },
    severity: {
      mild: 'हल्का',
      moderate: 'मध्यम',
      severe: 'गंभीर',
      emergency: 'आपातकाल',
    },
  },
  te: {
    navigation: {
      home: 'హోమ్',
      consult: 'సంప్రదించు',
      hospitals: 'ఆసుపత్రులు',
      history: 'చరిత్ర',
      about: 'గురించి',
    },
    consultation: {
      start_listening: 'వినడం ప్రారంభించు',
      listening: 'వింటున్నాను...',
      processing: 'ప్రాసెస్ అవుతోంది...',
      speak_now: 'ఇప్పుడు మాట్లాడండి',
      tap_to_speak: 'మాట్లాడటానికి నొక్కండి',
      wake_word_hint: "'హే వైద్య' అని చెప్పండి",
    },
    emergency: {
      emergency_detected: '🚨 అత్యవసర పరిస్థితి',
      call_108: 'ఇప్పుడు 108 కు కాల్ చేయండి',
      go_to_hospital: 'దగ్గరి ఆసుపత్రికి వెళ్ళండి',
      stay_calm: 'ప్రశాంతంగా ఉండండి. సహాయం వస్తోంది.',
    },
    common: {
      loading: 'లోడ్ అవుతోంది...',
      error: 'ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.',
      disclaimer: 'వైద్య AI సాధారణ ఆరోగ్య సమాచారం మాత్రమే అందిస్తుంది. ఎల్లప్పుడూ అర్హత కలిగిన వైద్యుడిని సంప్రదించండి.',
      try_again: 'మళ్ళీ ప్రయత్నించండి',
      close: 'మూసివేయి',
      back: 'వెనక్కి వెళ్ళు',
    },
    hospital: {
      nearby_hospitals: 'సమీప ఆసుపత్రులు',
      get_directions: 'దిశలు పొందు',
      distance: 'కి.మీ దూరం',
      get_location: 'నా స్థానం పొందు',
      no_hospitals: 'సమీపంలో ఆసుపత్రులు కనుగొనబడలేదు.',
    },
    history: {
      consultation_history: 'సంప్రదింపుల చరిత్ర',
      clear_history: 'చరిత్ర తొలగించు',
      no_history: 'ఇంకా సంప్రదింపులు లేవు.',
      export: 'ఎగుమతి',
    },
    severity: {
      mild: 'తేలికపాటి',
      moderate: 'మధ్యస్థ',
      severe: 'తీవ్రమైన',
      emergency: 'అత్యవసరం',
    },
  },
}

export function t(lang: LanguageCode, key: string): string {
  const keys = key.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations[lang]
  for (const k of keys) {
    value = value?.[k]
  }
  return value || key
}

export default translations
