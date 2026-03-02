'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle, MapPin, Phone, Building2, Send, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EmergencyPage() {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [notFeasible, setNotFeasible] = useState(false)
  const [respondingHospitals, setRespondingHospitals] = useState([])
  const [method, setMethod] = useState(null)
  const [form, setForm] = useState({
    description: '',
    address: '',
    latitude: null,
    longitude: null,
    hospitalId: '',
    patientName: '',
  })

  useEffect(() => {
    fetch('/api/user/hospitals?type=emergency')
      .then(r => r.json())
      .then(d => setHospitals(d.hospitals || []))
      .catch(console.error)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude })),
        () => {}
      )
    }
  }, [])

  const handleSendAlert = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to send alert')

      // Not feasible — no hospitals in area
      if (data.feasible === false) {
        setNotFeasible(true)
        return
      }

      setSent(true)
      setMethod(data.method)
      setRespondingHospitals(data.hospitals || [])
      toast.success(`Emergency alert sent to ${data.alertCount} hospital(s)!`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Not Feasible Screen ──────────────────────────────────────
  if (notFeasible) return (
    <div className="max-w-lg mx-auto text-center py-10">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <XCircle size={40} className="text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">No Hospitals Available</h1>
        <p className="text-gray-500 text-sm mb-6">
          We couldn't find any emergency hospitals in your area. Please use the national emergency number immediately.
        </p>

        {/* National Emergency */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-5 text-left">
          <p className="text-xs font-semibold text-red-600 mb-3">CALL IMMEDIATELY</p>
          <div className="space-y-3">
            {[
              { label: 'National Ambulance', number: '108' },
              { label: 'Police', number: '100' },
              { label: 'Fire & Emergency', number: '101' },
              { label: 'National Emergency', number: '112' },
            ].map(({ label, number }) => (
              <a key={number} href={`tel:${number}`}
                className="flex items-center justify-between bg-white border border-red-100 rounded-xl px-4 py-3 hover:bg-red-50 transition-colors">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="flex items-center gap-2 text-red-600 font-bold text-lg">
                  <Phone size={16} /> {number}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Option to enter location */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5 text-left">
          <p className="text-xs font-semibold text-yellow-700 mb-2">📍 Try with your location</p>
          <p className="text-xs text-yellow-600 mb-3">
            Update your city in your profile so we can find nearby hospitals next time.
          </p>
          <input type="text"
            placeholder="Enter your city / area..."
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            className="w-full border border-yellow-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white" />
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setNotFeasible(false) }}
            className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl text-sm font-medium transition-colors">
            Try Again
          </button>
          <a href="/user/profile"
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors text-center">
            Update Location
          </a>
        </div>
      </div>
    </div>
  )

  // ── Alert Sent Screen ──────────────────────────────────────
  if (sent) return (
    <div className="max-w-lg mx-auto text-center py-10">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Alert Sent! 🚨</h1>
        <p className="text-gray-500 text-sm mb-2">Emergency services have been notified. Help is on the way.</p>

        {/* Method badge */}
        {method && (
          <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium mb-5
            ${method === 'gps' ? 'bg-blue-100 text-blue-700' :
              method === 'city' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'}`}>
            {method === 'gps' ? '📍 Found via GPS location' :
             method === 'city' ? '🏙️ Found via your city' :
             '✅ Specific hospital selected'}
          </span>
        )}

        <div className="space-y-3 text-left mb-6">
          <p className="text-xs font-semibold text-gray-500">NOTIFIED HOSPITALS</p>
          {respondingHospitals.map((h, i) => (
            <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="font-semibold text-gray-800 text-sm">{h.name}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                <MapPin size={11} />
                <span>{h.address}</span>
                {h.distanceKm && <span className="ml-1 text-teal-600 font-medium">({h.distanceKm})</span>}
              </div>
              <a href={`tel:${h.phone}`}
                className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-1.5 hover:underline">
                <Phone size={11} /> {h.phone}
              </a>
            </div>
          ))}
        </div>

        {/* National Numbers */}
        <div className="bg-gray-50 rounded-xl p-3 mb-5 text-left">
          <p className="text-xs font-semibold text-gray-500 mb-2">ALSO CALL IF NEEDED</p>
          <div className="flex gap-2 flex-wrap">
            {[['Ambulance', '108'], ['Emergency', '112'], ['Police', '100']].map(([label, num]) => (
              <a key={num} href={`tel:${num}`}
                className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-colors">
                <Phone size={10} /> {label} — {num}
              </a>
            ))}
          </div>
        </div>

        <button onClick={() => { setSent(false); setRespondingHospitals([]); setMethod(null) }}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
          Send Another Alert
        </button>
      </div>
    </div>
  )

  // ── Main Form ────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Warning Banner */}
      <div className="bg-red-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle size={24} />
          <h1 className="text-xl font-bold">Emergency Alert</h1>
        </div>
        <p className="text-red-100 text-sm">
          Use this only for genuine medical emergencies. Sending false alerts is a punishable offence.
        </p>
      </div>

      {/* Location Status */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm
        ${form.latitude ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
        <MapPin size={16} />
        {form.latitude
          ? `✅ GPS location detected — nearest hospitals will be alerted`
          : '⚠️ GPS not available — will match by your city. Enter address below for accuracy.'}
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

        {/* Hospital selection */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Select Specific Hospital <span className="text-gray-400">(optional — leave blank to auto-detect nearest)</span>
          </label>
          <select value={form.hospitalId}
            onChange={e => setForm({ ...form, hospitalId: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
            <option value="">Auto-detect nearest emergency hospital</option>
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>{h.name} — {h.city || h.address}</option>
            ))}
          </select>
        </div>

        {/* Patient Name */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Patient Name <span className="text-gray-400">(leave blank to use your name)</span>
          </label>
          <input type="text"
            placeholder="Patient full name..."
            value={form.patientName}
            onChange={e => setForm({ ...form, patientName: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Your Current Address / City
          </label>
          <input type="text"
            placeholder="e.g. Vijayawada, Andhra Pradesh..."
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Emergency Description</label>
          <textarea
            placeholder="Describe the emergency (e.g. chest pain, accident, unconscious patient)..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
        </div>

        {/* Send Button */}
        <button onClick={handleSendAlert} disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-base transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {loading
            ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending Alert...</>
            : <><Send size={18} /> Send Emergency Alert</>}
        </button>
      </div>

      {/* National Emergency Numbers */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">📞 National Emergency Numbers</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Ambulance', number: '108' },
            { label: 'National Emergency', number: '112' },
            { label: 'Police', number: '100' },
            { label: 'Fire', number: '101' },
          ].map(({ label, number }) => (
            <a key={number} href={`tel:${number}`}
              className="flex items-center justify-between bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl px-4 py-3 transition-colors">
              <span className="text-xs text-gray-600">{label}</span>
              <span className="flex items-center gap-1.5 text-red-600 font-bold text-sm">
                <Phone size={13} /> {number}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Nearby Emergency Hospitals List */}
      {hospitals.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">🏥 Emergency Hospitals in System</h2>
          <div className="space-y-3">
            {hospitals.map(h => (
              <div key={h.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <Building2 size={18} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{h.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={10} /> {h.city || h.address}
                    </p>
                  </div>
                </div>
                <a href={`tel:${h.phone}`}
                  className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl text-xs font-medium transition-colors">
                  <Phone size={12} /> Call
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
