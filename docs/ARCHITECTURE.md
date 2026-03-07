# VaidyaAI — System Architecture

## Overview

VaidyaAI is a voice-first AI medical assistant for rural India. All speech processing happens in the browser using the free Web Speech API. Only the AI reasoning call goes to the backend (Gemini 2.5 Flash free tier).

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│                                                                     │
│  ┌──────────────┐    ┌──────────────────────────────────────────┐   │
│  │  Web Speech  │    │         Next.js 14 Frontend              │   │
│  │    API       │◄──►│  (TypeScript + Tailwind + Framer Motion) │   │
│  │  (FREE)      │    │                                          │   │
│  │  STT + TTS   │    │  Pages: Home / Consult / Hospitals /     │   │
│  └──────────────┘    │         History / Emergency / About      │   │
│                      └──────────────┬───────────────────────────┘   │
│                                     │ REST API calls only           │
└─────────────────────────────────────┼───────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Python)                         │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  ┌──────────┐   │
│  │ /api/       │  │ /api/        │  │ /api/     │  │ /api/    │   │
│  │consultation │  │ hospitals/   │  │ emergency/│  │ health   │   │
│  │             │  │ nearby       │  │ check     │  │          │   │
│  └──────┬──────┘  └──────┬───────┘  └─────┬─────┘  └──────────┘   │
│         │                │                │                        │
│  ┌──────▼──────────────────────────────────▼──────────────────┐    │
│  │                   Services Layer                            │    │
│  │  SymptomExtractor → SeverityAssessor → MedicalRAG →       │    │
│  │  LLMEngine (Gemini) → SafetyLayer                          │    │
│  │  HospitalFinder (Haversine)                                │    │
│  └──────────────────────────┬──────────────────────────────────┘    │
│                             │                                       │
│  ┌──────────────────────────▼──────────────────────────────────┐    │
│  │                   Data Layer (JSON files)                   │    │
│  │  medical_knowledge.json  hospitals_india.json               │    │
│  │  emergency_keywords.json symptoms_database.json             │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│              External Services (ALL FREE)                          │
│                                                                     │
│  Google Gemini 2.5 Flash API    OpenStreetMap / Leaflet.js          │
│  (Free: 10 RPM, 250 RPD)        (Completely free, no API key)       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom color palette
- **Animations**: Framer Motion
- **Maps**: Leaflet.js + OpenStreetMap (free)
- **Speech**: Web Speech API (browser-native, free)
- **PWA**: next-pwa for installable mobile app

### Key Design Decisions

| Decision | Reason |
|----------|--------|
| Web Speech API for STT/TTS | Completely free, supports Indian languages |
| Browser-side speech processing | Low latency, no API costs, privacy |
| Next.js App Router | Server components by default, good performance |
| Tailwind CSS | Fast styling, mobile-first, purged CSS |
| Framer Motion | Smooth animations for premium UX |
| localStorage for history | No database needed, works offline |

### Component Tree

```
app/layout.tsx
├── Navbar (desktop)
├── MobileNav (mobile)
├── {children}
│   ├── page.tsx (Home)
│   ├── consultation/page.tsx
│   │   ├── WakeWordDetector
│   │   ├── VoiceButton
│   │   ├── VoiceVisualizer
│   │   ├── TalkToInterrupt
│   │   ├── GuidancePanel
│   │   ├── SymptomCard
│   │   ├── SeverityBadge
│   │   └── EmergencyAlert
│   ├── hospitals/page.tsx
│   │   ├── HospitalMap (Leaflet, ssr:false)
│   │   ├── HospitalList
│   │   └── HospitalCard
│   ├── history/page.tsx
│   ├── emergency/page.tsx
│   └── about/page.tsx
└── MedicalDisclaimer
```

### Hooks

| Hook | Purpose |
|------|---------|
| `useVoiceRecognition` | Web Speech API SpeechRecognition wrapper |
| `useWakeWord` | Continuous "Hey Vaidya" detection |
| `useTalkToInterrupt` | Barge-in: detect speech during TTS playback |
| `useTextToSpeech` | SpeechSynthesis wrapper with language support |
| `useGeolocation` | Browser Geolocation API wrapper |
| `useMediaQuery` | Responsive breakpoint detection |

---

## Backend Architecture

### Technology Stack
- **Framework**: FastAPI (Python 3.11)
- **LLM**: Google Gemini 2.5 Flash (free tier)
- **Data**: JSON files (no database required)
- **Models**: Pydantic v2

### Consultation Flow

```
POST /api/consultation
        │
        ▼
1. SymptomExtractor.extract(text, language)
   - Matches text against symptoms_database.json
   - Returns list of SymptomInfo
        │
        ▼
2. SeverityAssessor.check_emergency(text, language)
   - Checks emergency_keywords.json
   - Returns EmergencyResult
        │
        ├─── [IS EMERGENCY] ──► Return EmergencyResponse immediately
        │
        ▼ [NOT EMERGENCY]
3. MedicalRAG.retrieve(symptoms)
   - Matches symptoms against medical_knowledge.json
   - Returns relevant medical context
        │
        ▼
4. LLMEngine.generate_medical_guidance(symptoms, context, language, severity)
   - Calls Gemini 2.5 Flash API
   - With system prompt enforcing safety rules
   - Falls back to safe default if API unavailable
        │
        ▼
5. SafetyLayer.apply(response)
   - Removes diagnostic statements
   - Adds disclaimers
   - Ensures emergency escalation
        │
        ▼
   ConsultationResponse
```

### Hospital Finder

```
GET /api/hospitals/nearby?lat=X&lng=Y&limit=N
        │
        ▼
HospitalFinder.find_nearest(lat, lng, limit)
   - Loads hospitals_india.json (50+ hospitals)
   - Calculates Haversine distance for each
   - Sorts by distance
   - Returns top N hospitals
```

---

## Data Flow: Voice Consultation

```
1. User says "Hey Vaidya"
   └─► useWakeWord detects wake phrase via SpeechRecognition (continuous)
       └─► Plays activation sound, opens mic for main input

2. User speaks symptoms
   └─► useVoiceRecognition captures speech
       └─► Transcribes to text (interim + final)

3. Text sent to backend
   └─► POST /api/consultation { text, language }
       └─► Returns { guidance, symptoms, severity, is_emergency }

4. Emergency check
   └─► If is_emergency: Show EmergencyAlert, speak 108 message
   └─► Else: Display GuidancePanel with AI response

5. AI speaks response
   └─► useTextToSpeech.speak(guidance, language)
       └─► useTalkToInterrupt active: if user speaks ≥2 words
           └─► Cancel TTS, process new input as fresh query

6. History saved to localStorage
```

---

## Free Services Used

| Service | Provider | Cost | Limits |
|---------|----------|------|--------|
| Speech-to-Text | Web Speech API (browser) | Free | Browser-native |
| Text-to-Speech | Web Speech API (browser) | Free | Browser-native |
| AI/LLM | Google Gemini 2.5 Flash | Free tier | 10 RPM, 250 RPD |
| Maps | OpenStreetMap + Leaflet.js | Free | No limits |
| Hospital Data | Bundled JSON | Free | Included in app |
| Frontend Hosting | Vercel | Free tier | 100GB bandwidth |
| Backend Hosting | Railway/Render | Free tier | 500 hours/month |

---

## Deployment Architecture

### Development
```
localhost:3000 (Next.js dev server)  ←→  localhost:8000 (FastAPI/uvicorn)
```

### Production
```
Vercel (Frontend)  ←→  Railway/Render (FastAPI Backend)
     ↓                         ↓
  CDN + Edge              Google Gemini API
  OpenStreetMap tiles     (free tier)
```

### Docker (Self-Hosted)
```
docker-compose up
├── frontend container (port 3000)  [Next.js]
└── backend container (port 8000)   [FastAPI + uvicorn]
```

---

## Security Considerations

1. **No sensitive data stored**: Consultations in localStorage only (client-side)
2. **API key server-side only**: Gemini key never exposed to browser
3. **CORS configured**: Backend only accepts requests from known origins in production
4. **Input validation**: Pydantic models validate all API inputs
5. **Safety layer**: All LLM outputs post-processed to remove diagnoses
6. **Rate limiting**: Gemini free tier enforces 10 RPM naturally
7. **Medical disclaimer**: Visible on every page, in API responses

---

## Performance

- **First Contentful Paint**: < 2s (Next.js static generation)
- **Time to Interactive**: < 3s
- **Speech latency**: < 500ms (browser-native STT)
- **API response**: 2-5s (Gemini inference)
- **PWA**: Installable, works offline for history viewing
- **Mobile-optimized**: 360px minimum width, large touch targets (48px+)
