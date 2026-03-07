# VaidyaAI API Reference

## Base URL
- Development: `http://localhost:8000`
- Production: `https://your-backend.railway.app`

---

## Endpoints

### GET /api/health
Health check.

**Response:**
```json
{"status": "healthy", "version": "1.0.0"}
```

---

### POST /api/consultation
Main medical consultation endpoint.

**Request:**
```json
{"text": "I have fever and headache", "language": "en"}
```
`language`: `"en"` | `"hi"` | `"te"`

**Response:**
```json
{
  "guidance": "I understand you're not feeling well...",
  "symptoms": [{"name": "fever", "severity": "moderate"}],
  "severity": "moderate",
  "is_emergency": false,
  "disclaimer": "This is AI-generated general guidance, not medical advice.",
  "language": "en",
  "home_remedies": ["Rest and drink plenty of fluids"],
  "when_to_seek_help": "If fever exceeds 103°F"
}
```

---

### POST /api/emergency/check
Check if text contains emergency keywords.

**Request:**
```json
{"text": "chest pain can't breathe", "language": "en"}
```

**Response:**
```json
{
  "is_emergency": true,
  "emergency_type": "cardiac",
  "message": "This sounds like an emergency. Call 108 immediately.",
  "call_number": "108"
}
```

---

### GET /api/hospitals/nearby
Find nearest hospitals by coordinates.

**Query params:** `lat`, `lng`, `limit` (default: 10)

**Example:** `GET /api/hospitals/nearby?lat=17.385&lng=78.486&limit=5`

**Response:**
```json
{
  "hospitals": [
    {
      "id": "h001",
      "name": "Government General Hospital",
      "type": "District Hospital",
      "address": "Nampally, Hyderabad",
      "district": "Hyderabad",
      "state": "Telangana",
      "lat": 17.3905,
      "lng": 78.4726,
      "phone": "040-24600271",
      "beds": 1200,
      "distance_km": 1.8
    }
  ],
  "total": 5
}
```

---

## Rate Limits
Gemini free tier: **10 requests/minute, 250 requests/day**. The app returns a safe fallback response when the limit is exceeded.

## Error Responses
```json
{"detail": "Error message"}
```
HTTP 422 for validation errors, HTTP 500 for server errors.
