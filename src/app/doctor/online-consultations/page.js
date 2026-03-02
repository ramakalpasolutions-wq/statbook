'use client'
import { useEffect, useState, useCallback } from 'react'
import { Video, Search, CalendarDays, Clock, User } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-teal-100 text-teal-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  RESCHEDULED: 'bg-blue-100 text-blue-700',
}

export default function DoctorOnlineConsultationsPage() {
  const [consultations, setConsultations] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [rescheduleId, setRescheduleId] = useState(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')

  const load = useCallback(async () => {
  setLoading(true)
  try {
    const q = new URLSearchParams()
    if (startDate) q.set('startDate', startDate)
    if (endDate) q.set('endDate', endDate)
    const res = await fetch(`/api/doctor/online-consultations?${q}`)
    if (!res.ok) throw new Error('Failed')
    const data = await res.json()
    setConsultations(data.consultations || [])
  } catch (err) {
    console.error('Online consultations error:', err)
  } finally {
    setLoading(false)
  }
}, [startDate, endDate])


  useEffect(() => { load() }, [load])

  const updateStatus = async (id, status, extra = {}) => {
    const res = await fetch('/api/doctor/online-consultations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, ...extra }),
    })
    if (res.ok) { toast.success(`Marked as ${status.toLowerCase()}`); load(); setRescheduleId(null) }
    else toast.error('Failed to update')
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Video size={24} className="text-teal-600" /> Online Consultations</h2>
        <p className="text-sm text-gray-500 mt-0.5">Today's video consultations</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-3 flex-wrap">
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <button onClick={() => { setStartDate(''); setEndDate('') }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">Reset</button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" /></div>
      ) : consultations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Video size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No online consultations found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {consultations.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                <span className="text-xs text-gray-400 font-mono">{c.consultationId}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"><User size={18} className="text-blue-600" /></div>
                <div>
                  <p className="font-semibold text-gray-800">{c.user?.name}</p>
                  <p className="text-xs text-gray-400">{c.user?.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5"><CalendarDays size={14} className="text-gray-400" />{new Date(c.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                <div className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400" />{c.time}</div>
              </div>

              {c.description && <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">{c.description}</p>}

              {c.meetLink && (
                <a href={c.meetLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm px-4 py-2 rounded-lg w-full justify-center font-medium">
                  <Video size={15} /> Join Meet
                </a>
              )}
              {!c.meetLink && <p className="text-xs text-gray-400 text-center">Meet link not assigned yet</p>}

              {['PENDING', 'ACCEPTED'].includes(c.status) && (
                <div className="flex gap-2 flex-wrap pt-1">
                  {c.status === 'ACCEPTED' && <button onClick={() => updateStatus(c.id, 'COMPLETED')} className="flex-1 px-3 py-1.5 text-xs font-medium bg-green-100 hover:bg-green-200 text-green-700 rounded-lg">Complete</button>}
                  <button onClick={() => setRescheduleId(rescheduleId === c.id ? null : c.id)} className="flex-1 px-3 py-1.5 text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg">Reschedule</button>
                </div>
              )}

              {rescheduleId === c.id && (
                <div className="bg-blue-50 p-3 rounded-lg space-y-2">
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full border border-gray-200 rounded px-3 py-1.5 text-xs" />
                  <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full border border-gray-200 rounded px-3 py-1.5 text-xs" />
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(c.id, 'RESCHEDULED', { newDate, newTime })} className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg">Confirm</button>
                    <button onClick={() => setRescheduleId(null)} className="flex-1 px-3 py-1.5 text-xs bg-gray-200 rounded-lg">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
