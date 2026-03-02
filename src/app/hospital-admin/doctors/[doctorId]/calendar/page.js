'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, Trash2, CalendarOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DoctorCalendarPage() {
  const { doctorId } = useParams()
  const router = useRouter()
  const [doctor, setDoctor] = useState(null)
  const [leaves, setLeaves] = useState([])
  const [consultations, setConsultations] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showAddLeave, setShowAddLeave] = useState(false)
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' })
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    fetch(`/api/hospital-admin/doctors/${doctorId}/calendar`)
      .then((r) => r.json())
      .then((data) => {
        setDoctor(data.doctor)
        setLeaves(data.leaves)
        setConsultations(data.consultations)
      })
  }, [doctorId])

  const addLeave = async () => {
    if (!leaveForm.startDate || !leaveForm.endDate) {
      toast.error('Select start and end dates')
      return
    }
    const res = await fetch(`/api/hospital-admin/doctors/${doctorId}/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveForm),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('Leave added!')
      setLeaves([...leaves, data.leave])
      setLeaveForm({ startDate: '', endDate: '', reason: '' })
      setShowAddLeave(false)
    } else {
      toast.error(data.error || 'Failed')
    }
  }

  const deleteLeave = async (id) => {
    await fetch(`/api/hospital-admin/doctors/${doctorId}/calendar`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    toast.success('Leave removed')
    setLeaves(leaves.filter((l) => l.id !== id))
  }

  // ─── Calendar Helpers ─────────────────────────────────────
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth, year, month }
  }

  const isOnLeave = (date) => {
    return leaves.some((l) => {
      const start = new Date(l.startDate); start.setHours(0, 0, 0, 0)
      const end = new Date(l.endDate); end.setHours(23, 59, 59, 999)
      return date >= start && date <= end
    })
  }

  const getConsultationsForDay = (date) => {
    return consultations.filter((c) => {
      const d = new Date(c.date)
      return d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
    })
  }

  const isToday = (date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  const isPast = (date) => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    return date < today
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    setSelectedDay(null)
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    setSelectedDay(null)
  }

  const { firstDay, daysInMonth, year, month } = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const selectedDayConsults = selectedDay ? getConsultationsForDay(selectedDay) : []
  const selectedLeave = selectedDay ? leaves.find((l) => {
    const start = new Date(l.startDate); start.setHours(0, 0, 0, 0)
    const end = new Date(l.endDate); end.setHours(23, 59, 59, 999)
    return selectedDay >= start && selectedDay <= end
  }) : null

  const statusColors = {
    COMPLETED: 'bg-green-500',
    PENDING: 'bg-yellow-500',
    ACCEPTED: 'bg-teal-500',
    CANCELLED: 'bg-red-500',
    RESCHEDULED: 'bg-blue-500',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{doctor?.name}</h2>
            <p className="text-sm text-gray-500">{doctor?.specializations?.join(', ')}</p>
          </div>
        </div>
        <button onClick={() => setShowAddLeave(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          <CalendarOff size={15} /> Mark Leave
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs font-medium">
        {[
          { color: 'bg-red-200', label: 'On Leave' },
          { color: 'bg-yellow-400', label: 'Has Consultations' },
          { color: 'bg-blue-600', label: 'Today' },
          { color: 'bg-gray-100', label: 'Available' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded ${color}`} />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">
              <ChevronLeft size={18} />
            </button>
            <h3 className="font-bold text-gray-800 text-lg">{monthName}</h3>
            <button onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for first week */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = new Date(year, month, i + 1)
              const onLeave = isOnLeave(date)
              const dayConsults = getConsultationsForDay(date)
              const hasConsults = dayConsults.length > 0
              const today = isToday(date)
              const past = isPast(date)
              const isSelected = selectedDay &&
                selectedDay.getDate() === date.getDate() &&
                selectedDay.getMonth() === date.getMonth()

              return (
                <button key={i} onClick={() => setSelectedDay(date)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition text-sm font-medium
                    ${isSelected ? 'ring-2 ring-blue-600' : ''}
                    ${today ? 'bg-blue-600 text-white font-bold' : ''}
                    ${onLeave && !today ? 'bg-red-100 text-red-700' : ''}
                    ${hasConsults && !onLeave && !today ? 'bg-yellow-50 text-yellow-800' : ''}
                    ${!onLeave && !hasConsults && !today ? 'hover:bg-gray-50 text-gray-700' : ''}
                    ${past && !today ? 'opacity-50' : ''}`}>
                  <span>{i + 1}</span>
                  {hasConsults && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayConsults.slice(0, 3).map((c, ci) => (
                        <div key={ci}
                          className={`w-1.5 h-1.5 rounded-full ${today ? 'bg-white' : statusColors[c.status] || 'bg-gray-400'}`} />
                      ))}
                    </div>
                  )}
                  {onLeave && !today && (
                    <div className="text-xs text-red-500 mt-0.5">✕</div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Selected Day Details */}
          {selectedDay && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h4 className="font-semibold text-gray-800 mb-3">
                {selectedDay.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h4>

              {selectedLeave && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                  <p className="text-sm font-semibold text-red-700">🏖️ On Leave</p>
                  {selectedLeave.reason && (
                    <p className="text-xs text-red-500 mt-1">{selectedLeave.reason}</p>
                  )}
                </div>
              )}

              {selectedDayConsults.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {selectedDayConsults.length} Consultation{selectedDayConsults.length > 1 ? 's' : ''}
                  </p>
                  {selectedDayConsults.map((c) => (
                    <div key={c.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-gray-800">{c.user?.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${c.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            c.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            c.status === 'ACCEPTED' ? 'bg-teal-100 text-teal-700' :
                            c.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'}`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{c.time}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block
                        ${c.type === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {c.type}
                      </span>
                    </div>
                  ))}
                </div>
              ) : !selectedLeave ? (
                <p className="text-sm text-gray-400 text-center py-4">No consultations</p>
              ) : null}
            </div>
          )}

          {/* Leaves List */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CalendarOff size={15} className="text-red-500" />
              Leaves ({leaves.length})
            </h4>
            {leaves.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-3">No leaves scheduled</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {leaves.map((l) => (
                  <div key={l.id} className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-red-700">
                          {new Date(l.startDate).toLocaleDateString('en-IN')}
                          {' → '}
                          {new Date(l.endDate).toLocaleDateString('en-IN')}
                        </p>
                        {l.reason && <p className="text-xs text-red-500 mt-0.5">{l.reason}</p>}
                      </div>
                      <button onClick={() => deleteLeave(l.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 text-red-600 flex-shrink-0">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Leave Modal */}
      {showAddLeave && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-5 flex items-center gap-2">
              <CalendarOff size={18} className="text-red-500" /> Mark Doctor Leave
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                <input type="date" value={leaveForm.startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
                <input type="date" value={leaveForm.endDate}
                  min={leaveForm.startDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <textarea rows={2} value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="e.g. Personal leave, Conference..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addLeave}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition text-sm">
                Mark Leave
              </button>
              <button onClick={() => setShowAddLeave(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
