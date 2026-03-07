# 🩺 VaidyaAI — AI Doctor for Rural India

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Made in India](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F-India-orange)
![Free APIs](https://img.shields.io/badge/APIs-100%25%20Free-green)

> Voice-based • Multilingual • Free • Emergency-Ready

---

## 🏥 The Problem

- **600M+ rural Indians** have limited access to doctors
- Many are **not literate** or comfortable with text-based apps
- They speak **Telugu, Hindi, Tamil** — not English
- Existing health apps are English-only, text-only, urban-focused

## 💡 The Solution

VaidyaAI is a **voice-first AI medical assistant** that:
- Understands spoken Telugu, Hindi, and English
- Responds with voice in the patient's language
- Detects emergencies and connects to 108 ambulance
- Finds the nearest government hospital/PHC
- Works as an installable mobile app (PWA)
- Uses **100% free APIs** — no subscription needed

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎤 **Wake Word** | Say "Hey Vaidya" to activate, hands-free |
| 🗣️ **Talk-to-Interrupt** | Speak during AI response to stop and redirect |
| 🌐 **3 Languages** | Telugu, Hindi, English |
| 🚨 **Emergency Detection** | Detects life-threatening symptoms, calls 108 |
| 🏥 **Hospital Finder** | Nearest PHC/hospitals on interactive map |
| 📱 **PWA** | Install as native app on Android/iOS |
| 🌙 **Dark/Light Mode** | Automatic system preference detection |
| 💰 **100% Free** | Web Speech API + Gemini free tier + OpenStreetMap |
| 📋 **History** | Consultation history in localStorage |

---

## 🏗️ Architecture

```
Patient speaks → Wake Word ("Hey Vaidya") → Speech-to-Text (browser)
      ↓
FastAPI Backend → Gemini 2.5 Flash (free) → Medical guidance
      ↓
Text-to-Speech (browser) → Patient hears response
      ↓
Talk-to-Interrupt → Patient can speak anytime to redirect
```

---

## 🛠️ Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS | Free |
| Animations | Framer Motion | Free |
| Speech STT/TTS | Web Speech API (browser-native) | **Free** |
| AI/LLM | Google Gemini 2.5 Flash | **Free tier** |
| Maps | Leaflet.js + OpenStreetMap | **Free** |
| Backend | FastAPI (Python) | Free |
| Hospital Data | Bundled JSON (50+ hospitals) | **Free** |
| Hosting | Vercel + Railway/Render | **Free tier** |

---

## 🚀 Quick Start

### 1. Get a FREE Gemini API Key
Go to [Google AI Studio](https://aistudio.google.com) → Get API Key (free, 30 seconds)

### 2. Clone & Setup Backend
```bash
git clone https://github.com/Manikantakoushik-1/Vaidya_AI.git
cd Vaidya_AI/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_key_here" > .env
uvicorn app.main:app --reload --port 8000
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install --legacy-peer-deps
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local
npm run dev
```

### 4. Open http://localhost:3000

### 5. (Optional) Docker
```bash
echo "GEMINI_API_KEY=your_key" > .env
docker-compose up --build
```

---

## 📁 Project Structure

```
vaidya-ai/
├── frontend/          # Next.js 14 + TypeScript + Tailwind
│   ├── app/           # Pages: home, consultation, hospitals, history
│   ├── components/    # UI, voice, medical, hospital, layout components
│   ├── hooks/         # useVoiceRecognition, useWakeWord, useTalkToInterrupt
│   └── lib/           # API client, constants, i18n, emergency keywords
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── routers/   # consultation, hospitals, emergency, health
│   │   ├── services/  # LLM engine, RAG, symptom extractor, hospital finder
│   │   ├── models/    # Pydantic request/response models
│   │   └── data/      # medical_knowledge.json, hospitals_india.json
│   └── requirements.txt
├── docs/              # Architecture, Setup Guide, API Reference
└── docker-compose.yml
```

---

## 🌍 Environment Variables

**Backend** (`backend/.env`):
```
GEMINI_API_KEY=your_free_gemini_key
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## 📖 Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Setup Guide](docs/SETUP_GUIDE.md)
- [API Reference](docs/API_REFERENCE.md)

---

## ⚠️ Medical Disclaimer

**VaidyaAI provides general health information only, not medical advice.**
Always consult a qualified doctor for diagnosis and treatment.
In case of emergency, call **108** immediately.

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). PRs welcome!

---

## 📄 License

MIT License — see [LICENSE](LICENSE)

---

**Built with ❤️ for Rural India** | VaidyaAI
