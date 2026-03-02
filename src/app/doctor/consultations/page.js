'use client'
import { useEffect, useState, useCallback } from 'react'
import { Search, User, CalendarDays, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-teal-100 text-teal-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  RESCHEDULED: 'bg-blue-100 text-blue-700',
}

export default function DoctorConsultationsPage() {
  const [consultations, setConsultations] = useState([])
  const [search, setSearch] = useState('')
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
    if (search) q.set('search', search)
    if (startDate) q.set('startDate', startDate)
    if (endDate) q.set('endDate', endDate)
    const res = await fetch(`/api/doctor/consultations?${q}`)
    if (!res.ok) throw new Error('Failed')
    const data = await res.json()
    setConsultations(data.consultations || [])
  } catch (err) {
    console.error('Consultations error:', err)
  } finally {
    setLoading(false)
  }
}, [search, startDate, endDate])


  useEffect(() => { load() }, [load])

  const updateStatus = async (id, status, extra = {}) => {
    const res = await fetch('/api/doctor/consultations', {
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
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><CalendarDays size={24} className="text-teal-600" /> Consultations</h2>
        <p className="text-sm text-gray-500 mt-0.5">Today's in-hospital consultations</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search patient, ID..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <button onClick={() => { setSearch(''); setStartDate(''); setEndDate('') }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">Reset</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['ID', 'Patient', 'Date & Time', 'Fee', 'Description', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody>
              {consultations.map(c => (
                <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.consultationId}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><User size={13} className="text-blue-600" /></div>
                      <div><p className="font-medium text-gray-800">{c.user?.name}</p><p className="text-xs text-gray-400">{c.user?.phone}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-700 whitespace-nowrap"><CalendarDays size={13} className="text-gray-400" />{new Date(c.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-0.5"><Clock size={11} />{c.time}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700">₹{c.fee}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{c.description || '—'}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>{c.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {c.status === 'PENDING' && <button onClick={() => updateStatus(c.id, 'ACCEPTED')} className="px-2.5 py-1 text-xs font-medium bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-lg">Accept</button>}
                      {c.status === 'ACCEPTED' && <button onClick={() => updateStatus(c.id, 'COMPLETED')} className="px-2.5 py-1 text-xs font-medium bg-green-100 hover:bg-green-200 text-green-700 rounded-lg">Complete</button>}
                      {['PENDING', 'ACCEPTED'].includes(c.status) && (
                        <>
                          <button onClick={() => updateStatus(c.id, 'CANCELLED')} className="px-2.5 py-1 text-xs font-medium bg-red-100 hover:bg-red-200 text-red-700 rounded-lg">Cancel</button>
                          <button onClick={() => setRescheduleId(c.id)} className="px-2.5 py-1 text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg">Reschedule</button>
                        </>
                      )}
                    </div>
                    {/* Reschedule inline form */}
                    {rescheduleId === c.id && (
                      <div className="mt-2 flex gap-2 flex-wrap items-center bg-blue-50 p-2 rounded-lg">
                        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-xs" />
                        <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-xs" />
                        <button onClick={() => updateStatus(c.id, 'RESCHEDULED', { newDate, newTime })} className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg">Confirm</button>
                        <button onClick={() => setRescheduleId(null)} className="px-3 py-1 text-xs bg-gray-200 rounded-lg">Cancel</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {consultations.length === 0 && !loading && (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-gray-400"><CalendarDays size={36} className="text-gray-200 mx-auto mb-2" /><p>No consultations found</p></td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
