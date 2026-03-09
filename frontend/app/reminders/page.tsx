'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Bell, BellOff, Clock, Pill, X } from 'lucide-react'

interface Reminder {
  id: string
  medicineName: string
  dosage: string
  frequencyHours: number
  startTime: string
  isActive: boolean
  createdAt: string
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ medicineName: '', dosage: '', frequencyHours: 8, startTime: '' })
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    const stored = localStorage.getItem('vaidya_reminders')
    if (stored) setReminders(JSON.parse(stored))
    if (typeof Notification !== 'undefined') {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('vaidya_reminders', JSON.stringify(reminders))
  }, [reminders])

  // Check and fire notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      reminders.forEach(r => {
        if (!r.isActive) return
        const start = new Date(r.startTime)
        const diffMs = now.getTime() - start.getTime()
        const intervalMs = r.frequencyHours * 60 * 60 * 1000
        if (diffMs >= 0 && diffMs % intervalMs < 60000) {
          if (Notification.permission === 'granted') {
            new Notification('💊 Medicine Reminder - VaidyaAI', {
              body: `Time to take ${r.medicineName} (${r.dosage})`,
              icon: '/icons/icon-192x192.png',
            })
          }
        }
      })
    }, 60000) // check every minute
    return () => clearInterval(interval)
  }, [reminders])

  const requestPermission = async () => {
    if (typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission()
      setNotificationPermission(perm)
    }
  }

  const addReminder = () => {
    if (!form.medicineName.trim()) return
    const reminder: Reminder = {
      id: Date.now().toString(),
      medicineName: form.medicineName,
      dosage: form.dosage,
      frequencyHours: form.frequencyHours,
      startTime: form.startTime || new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    setReminders(prev => [reminder, ...prev])
    setForm({ medicineName: '', dosage: '', frequencyHours: 8, startTime: '' })
    setShowForm(false)
  }

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r))
  }

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Pill className="w-7 h-7 text-teal-600" /> Medicine Reminders
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {/* Permission Banner */}
        {notificationPermission !== 'granted' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellOff className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-amber-700 dark:text-amber-300">Enable notifications for reminders</span>
            </div>
            <button onClick={requestPermission} className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600">
              Enable
            </button>
          </motion.div>
        )}

        {/* Add Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
              onClick={() => setShowForm(false)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">New Reminder</h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-400"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Medicine Name</label>
                    <input value={form.medicineName} onChange={e => setForm({ ...form, medicineName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      placeholder="e.g., Paracetamol" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Dosage</label>
                    <input value={form.dosage} onChange={e => setForm({ ...form, dosage: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      placeholder="e.g., 500mg, 1 tablet" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Every (hours)</label>
                    <select value={form.frequencyHours} onChange={e => setForm({ ...form, frequencyHours: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none">
                      {[4, 6, 8, 12, 24].map(h => <option key={h} value={h}>{h} hours</option>)}
                    </select>
                  </div>
                  <button onClick={addReminder}
                    className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors">
                    Add Reminder
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reminder List */}
        {reminders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Pill className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No reminders yet.</p>
            <p className="text-sm mt-1">Add a medicine reminder to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border ${r.isActive ? 'border-teal-200 dark:border-teal-800' : 'border-gray-200 dark:border-gray-700 opacity-60'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${r.isActive ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/30' : 'bg-gray-100 text-gray-400'}`}>
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{r.medicineName}</h3>
                      {r.dosage && <p className="text-sm text-gray-500 dark:text-gray-400">{r.dosage}</p>}
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        Every {r.frequencyHours} hours
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleReminder(r.id)}
                      className={`p-2 rounded-lg transition-colors ${r.isActive ? 'text-teal-600 hover:bg-teal-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                      {r.isActive ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deleteReminder(r.id)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
