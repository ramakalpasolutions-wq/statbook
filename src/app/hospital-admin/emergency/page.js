'use client'
import { useEffect, useState } from 'react'
import { HeartPulse, MapPin, Phone, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EmergencyPage() {
  const [emergencies, setEmergencies] = useState([])
  const [filter, setFilter] = useState('PENDING')

  useEffect(() => { load() }, [filter])

  const load = async () => {
    const params = new URLSearchParams()
    if (filter) params.set('status', filter)
    const res = await fetch(`/api/hospital-admin/emergency?${params}`)
    const data = await res.json()
    setEmergencies(data.emergencies || [])
  }

  const attend = async (id) => {
    await fetch('/api/hospital-admin/emergency', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'ASSIGNED', attendedAt: new Date() }),
    })
    toast.success('Emergency marked as attended')
    load()
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <HeartPulse size={24} className="text-red-500" /> Emergency
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Active emergency requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['ALL', 'PENDING', 'ASSIGNED'].map((f) => (
          <button key={f} onClick={() => setFilter(f === 'ALL' ? '' : f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition
              ${(filter === f || (f === 'ALL' && !filter))
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Emergency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {emergencies.map((e) => (
          <div key={e.id}
            className={`bg-white rounded-xl border-2 shadow-sm p-5
              ${e.status === 'PENDING' ? 'border-red-300 animate-pulse-slow' : 'border-green-200'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{e.patientName}</h3>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                  <Phone size={14} />
                  <a href={`tel:${e.phone}`} className="hover:text-blue-600">{e.phone}</a>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold
                ${e.status === 'PENDING' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {e.status}
              </span>
            </div>

            {e.locationText && (
              <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                <MapPin size={14} className="flex-shrink-0 mt-0.5 text-red-500" />
                <span>{e.locationText}</span>
              </div>
            )}

            {e.latitude && e.longitude && (
              <a href={`https://maps.google.com/?q=${e.latitude},${e.longitude}`}
                target="_blank" rel="noreferrer"
                className="text-xs text-blue-600 hover:underline mb-2 inline-block">
                📍 Open in Google Maps
              </a>
            )}

            {e.note && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2 mb-3 italic">"{e.note}"</p>
            )}

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
  <Clock size={12} />
  {new Date(e.requestTime).toLocaleString('en-IN')}
</div>

              {e.status === 'PENDING' && (
                <button onClick={() => attend(e.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                  Mark Attended
                </button>
              )}
              {e.status === 'ASSIGNED' && e.attendedAt && (
                <p className="text-xs text-green-600 font-medium">
                  ✅ Attended at {new Date(e.attendedAt).toLocaleTimeString('en-IN')}
                </p>
              )}
            </div>
          </div>
        ))}
        {emergencies.length === 0 && (
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 py-16 text-center">
            <HeartPulse size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No emergencies found</p>
          </div>
        )}
      </div>
    </div>
  )
}
