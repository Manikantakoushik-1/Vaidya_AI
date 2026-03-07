import { BACKEND_URL } from './constants'

export interface ConsultationRequest {
  text: string
  language: string
  user_id?: string
}

export interface SymptomInfo {
  name: string
  severity: string
}

export interface ConsultationResponse {
  guidance: string
  symptoms: SymptomInfo[]
  severity: string
  is_emergency: boolean
  disclaimer: string
  language: string
  home_remedies?: string[]
  when_to_seek_help?: string
}

export interface Hospital {
  id: string
  name: string
  type: string
  address: string
  district: string
  state: string
  lat: number
  lng: number
  phone?: string
  beds?: number
  distance_km?: number
}

export async function consultWithAI(request: ConsultationRequest): Promise<ConsultationResponse> {
  const response = await fetch(`${BACKEND_URL}/api/consultation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) throw new Error('Consultation failed')
  return response.json()
}

export async function getNearbyHospitals(lat: number, lng: number, limit = 10): Promise<Hospital[]> {
  const response = await fetch(`${BACKEND_URL}/api/hospitals/nearby?lat=${lat}&lng=${lng}&limit=${limit}`)
  if (!response.ok) throw new Error('Failed to fetch hospitals')
  const data = await response.json()
  return data.hospitals
}

export async function checkEmergency(text: string, language: string): Promise<{ is_emergency: boolean; message: string }> {
  const response = await fetch(`${BACKEND_URL}/api/emergency/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
  })
  if (!response.ok) throw new Error('Emergency check failed')
  return response.json()
}
