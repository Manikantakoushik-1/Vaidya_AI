# VaidyaAI Setup Guide

## Prerequisites

- **Node.js** 18.x or later — [Download](https://nodejs.org)
- **Python** 3.11 or later — [Download](https://python.org)
- **Git** — [Download](https://git-scm.com)
- **Google AI Studio account** — to get a free Gemini API key

---

## Step 1: Get Your FREE Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com) — it's **completely free**
2. Sign in with your Google account
3. Click **"Get API Key"** → **"Create API Key"**
4. Copy your API key (starts with `AIza...`)
5. Free tier limits: **10 requests/minute, 250 requests/day, 250K tokens/minute**

---

## Step 2: Clone the Repository

```bash
git clone https://github.com/Manikantakoushik-1/Vaidya_AI.git
cd Vaidya_AI
```

---

## Step 3: Backend Setup

```bash
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=AIzaSy...your_key_here

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

The backend API will be available at: **http://localhost:8000**

To verify, open: http://localhost:8000/api/health

---

## Step 4: Frontend Setup

Open a **new terminal** and run:

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Create environment file
cp .env.example .env.local

# Edit .env.local
# NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Start the development server
npm run dev
```

The frontend will be available at: **http://localhost:3000**

---

## Docker Setup (Alternative)

If you prefer Docker, you can run the entire stack with one command:

```bash
# From the root directory
cp backend/.env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=AIzaSy...your_key_here

# Start everything
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | **YES** | Your Google Gemini API key (free from AI Studio) |
| `ENVIRONMENT` | No | `development` or `production` (default: development) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | No | Backend URL (default: http://localhost:8000) |

---

## Speech Recognition Requirements

VaidyaAI uses the browser's **Web Speech API** which is completely free. Requirements:

- **Recommended**: Google Chrome or Chromium-based browsers (best Telugu/Hindi support)
- **Supported**: Microsoft Edge
- **Limited**: Firefox (may not support all languages)
- **Mobile**: Chrome for Android works well

> **Note**: Allow microphone permissions when prompted by the browser.

---

## Production Deployment

### Frontend on Vercel (Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → "New Project"
3. Import your repository
4. Set root directory to `frontend`
5. Add environment variable: `NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app`
6. Deploy!

### Backend on Railway (Free)

1. Go to [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub"
3. Select your repository
4. Set root directory to `backend`
5. Add environment variable: `GEMINI_API_KEY=your_key`
6. Railway auto-detects the Dockerfile

### Backend on Render (Free)

1. Go to [render.com](https://render.com)
2. "New" → "Web Service"
3. Connect your GitHub repo
4. Set root directory to `backend`
5. Runtime: Docker
6. Add environment variable: `GEMINI_API_KEY=your_key`

---

## Troubleshooting

### Backend won't start

```
Error: GEMINI_API_KEY not configured
```
→ Make sure you've copied `.env.example` to `.env` and added your API key.

### Frontend can't reach backend

```
TypeError: Failed to fetch
```
→ Check that `NEXT_PUBLIC_BACKEND_URL` in `.env.local` matches your backend URL.
→ Ensure the backend is running on port 8000.

### Speech recognition not working

→ Use Google Chrome (not Firefox)
→ Make sure you're on HTTPS in production (required for microphone access)
→ Allow microphone permissions in browser settings

### Hindi/Telugu voice not available in TTS

→ Install Hindi/Telugu language packs in your OS settings
→ On Android: Settings → Accessibility → Text-to-Speech → Language
→ On Windows: Settings → Time & Language → Language → Add Hindi/Telugu

### CORS errors

→ In development, the backend allows all origins by default
→ In production, update `ALLOWED_ORIGINS` in `backend/app/main.py`

### Gemini rate limit exceeded

```
ResourceExhausted: 429 Too Many Requests
```
→ You've hit the free tier limit (10 RPM, 250 RPD)
→ The app will show a fallback response
→ Wait 1 minute or try next day

---

## Development Tips

### Hot reload both services

Terminal 1 (Backend):
```bash
cd backend && uvicorn app.main:app --reload
```

Terminal 2 (Frontend):
```bash
cd frontend && npm run dev
```

### Test the API

```bash
# Health check
curl http://localhost:8000/api/health

# Test consultation
curl -X POST http://localhost:8000/api/consultation \
  -H "Content-Type: application/json" \
  -d '{"text": "I have fever and headache", "language": "en"}'

# Test emergency
curl -X POST http://localhost:8000/api/emergency/check \
  -H "Content-Type: application/json" \
  -d '{"text": "chest pain can t breathe", "language": "en"}'

# Nearby hospitals
curl "http://localhost:8000/api/hospitals/nearby?lat=17.3850&lng=78.4867&limit=5"
```

### Add More Hospitals

Edit `backend/app/data/hospitals_india.json` to add more hospitals with real coordinates.

### Add More Medical Conditions

Edit `backend/app/data/medical_knowledge.json` following the existing format.

---

## Browser Support

| Browser | STT | TTS | Maps | Overall |
|---------|-----|-----|------|---------|
| Chrome 90+ | ✅ | ✅ | ✅ | ✅ Best |
| Edge 90+ | ✅ | ✅ | ✅ | ✅ Good |
| Firefox | ❌ | ✅ | ✅ | ⚠️ Limited |
| Safari (iOS 15+) | ⚠️ | ✅ | ✅ | ⚠️ Limited |
| Chrome Android | ✅ | ✅ | ✅ | ✅ Best |
