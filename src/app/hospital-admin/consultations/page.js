'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Eye, CalendarDays, Clock, User, Stethoscope } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  PENDING:     'bg-yellow-100 text-yellow-700',
  ACCEPTED:    'bg-teal-100 text-teal-700',
  COMPLETED:   'bg-green-100 text-green-700',
  CANCELLED:   'bg-red-100 text-red-700',
  RESCHEDULED: 'bg-blue-100 text-blue-700',
}

const TYPE_COLORS = {
  ONLINE:  'bg-blue-100 text-blue-700',
  OFFLINE: 'bg-gray-100 text-gray-700',
}

export default function ConsultationsPage() {
  const router = useRouter()
  const [consultations, setConsultations] = useState([])
  const [stats, setStats] = useState({})
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (search) query.set('search', search)
      if (status) query.set('status', status)
      if (type)   query.set('type', type)
      if (date)   query.set('date', date)
      const res = await fetch(`/api/hospital-admin/consultations?${query}`)
      const data = await res.json()
      setConsultations(data.consultations || [])
      setStats(data.stats || {})
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, status, type, date])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id, newStatus, extra = {}) => {
    const res = await fetch('/api/hospital-admin/consultations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus, ...extra }),
    })
    if (res.ok) {
      toast.success(`Consultation ${newStatus.toLowerCase()}`)
      load()
    } else {
      toast.error('Failed to update')
    }
  }

  const reset = () => { setSearch(''); setStatus(''); setType(''); setDate('') }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarDays size={24} className="text-blue-600" /> Consultations
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage all patient consultations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total',       value: stats.total,       cls: 'border-gray-200' },
          { label: 'Pending',     value: stats.pending,     cls: 'border-yellow-200' },
          { label: 'Accepted',    value: stats.accepted,    cls: 'border-teal-200' },
          { label: 'Completed',   value: stats.completed,   cls: 'border-green-200' },
          { label: 'Cancelled',   value: stats.cancelled,   cls: 'border-red-200' },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`bg-white rounded-xl border-2 p-4 text-center shadow-sm ${cls}`}>
            <p className="text-2xl font-bold text-gray-800">{value ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search patient, doctor, ID..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          {['PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Types</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={reset}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['ID', 'Patient', 'Doctor', 'Date & Time', 'Type', 'Fee', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                  {/* ID */}
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-gray-500">{c.consultationId}</p>
                  </td>

                  {/* Patient */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={13} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 whitespace-nowrap">{c.user?.name}</p>
                        <p className="text-xs text-gray-400">{c.user?.phone}</p>
                      </div>
                    </div>
                  </td>

                  {/* Doctor */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Stethoscope size={13} className="text-teal-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 whitespace-nowrap">{c.doctor?.name}</p>
                        <p className="text-xs text-gray-400">{c.doctor?.specializations?.[0]}</p>
                      </div>
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-700 whitespace-nowrap">
                      <CalendarDays size={13} className="text-gray-400" />
                      {new Date(c.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-0.5">
                      <Clock size={11} />
                      {c.time}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLORS[c.type]}`}>
                      {c.type === 'ONLINE' ? '🌐' : '🏥'} {c.type}
                    </span>
                  </td>

                  {/* Fee */}
                  <td className="px-4 py-3 font-semibold text-gray-700">₹{c.fee}</td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>
                      {c.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button onClick={() => router.push(`/hospital-admin/consultations/${c.id}`)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition">
                        <Eye size={13} />
                      </button>
                      {c.status === 'PENDING' && (
                        <>
                          <button onClick={() => updateStatus(c.id, 'ACCEPTED')}
                            className="px-2.5 py-1 text-xs font-medium bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-lg transition whitespace-nowrap">
                            Accept
                          </button>
                          <button onClick={() => updateStatus(c.id, 'CANCELLED', { cancelledBy: 'HOSPITAL' })}
                            className="px-2.5 py-1 text-xs font-medium bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition whitespace-nowrap">
                            Cancel
                          </button>
                        </>
                      )}
                      {c.status === 'ACCEPTED' && (
                        <button onClick={() => updateStatus(c.id, 'COMPLETED', { completedAt: new Date() })}
                          className="px-2.5 py-1 text-xs font-medium bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition whitespace-nowrap">
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {consultations.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <CalendarDays size={36} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400">No consultations found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
