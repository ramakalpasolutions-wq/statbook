'use client'
import { useEffect, useState } from 'react'
import { CalendarDays, Plus, Trash2, User } from 'lucide-react'
import toast from 'react-hot-toast'

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
function getFirstDay(year, month) { return new Date(year, month, 1).getDay() }

export default function DoctorCalendarPage() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [consultations, setConsultations] = useState([])
  const [leaves, setLeaves] = useState([])
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [monthData, setMonthData] = useState({})

  useEffect(() => { loadMonth() }, [currentYear, currentMonth])
  useEffect(() => { loadDay() }, [selectedDate])

  const loadMonth = async () => {
    try {
      const from = new Date(currentYear, currentMonth, 1).toISOString()
      const to = new Date(currentYear, currentMonth + 1, 0).toISOString()
      const res = await fetch(`/api/doctor/calendar?from=${from}&to=${to}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      const grouped = {}
      data.consultations?.forEach(c => {
        const key = new Date(c.date).toISOString().split('T')[0]
        grouped[key] = { ...(grouped[key] || {}), consultationCount: (grouped[key]?.consultationCount || 0) + 1 }
      })
      data.leaves?.forEach(l => {
        const s = new Date(l.startDate)
        const e = new Date(l.endDate)
        for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
          const key = new Date(d).toISOString().split('T')[0]
          grouped[key] = { ...(grouped[key] || {}), isLeave: true }
        }
      })
      setMonthData(grouped)
      setLeaves(data.leaves || [])
    } catch (err) {
      console.error('Calendar month error:', err)
    }
  }

  const loadDay = async () => {
    try {
      const from = new Date(selectedDate).toISOString()
      const to = new Date(new Date(selectedDate).setHours(23, 59, 59, 999)).toISOString()
      const res = await fetch(`/api/doctor/calendar?from=${from}&to=${to}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setConsultations(data.consultations || [])
    } catch (err) {
      console.error('Calendar day error:', err)
    }
  }

  const addLeave = async () => {
    if (!startDate || !endDate) return toast.error('Select start and end dates')
    try {
      const res = await fetch('/api/doctor/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate, reason }),
      })
      if (res.ok) {
        toast.success('Marked as unavailable')
        setStartDate(''); setEndDate(''); setReason('')
        loadMonth()
      } else {
        toast.error('Failed to mark leave')
      }
    } catch (err) {
      toast.error('Failed to mark leave')
    }
  }

  const deleteLeave = async (id) => {
    try {
      const res = await fetch('/api/doctor/calendar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) { toast.success('Leave removed'); loadMonth() }
    } catch (err) {
      toast.error('Failed to remove leave')
    }
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDay(currentYear, currentMonth)
  const monthName = new Date(currentYear, currentMonth).toLocaleString('en-IN', { month: 'long', year: 'numeric' })
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarDays size={24} className="text-teal-600" /> Calendar
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your schedule and unavailability</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => { const d = new Date(currentYear, currentMonth - 1); setCurrentYear(d.getFullYear()); setCurrentMonth(d.getMonth()) }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 font-bold text-lg">
                ‹
              </button>
              <h3 className="font-semibold text-gray-800">{monthName}</h3>
              <button
                onClick={() => { const d = new Date(currentYear, currentMonth + 1); setCurrentYear(d.getFullYear()); setCurrentMonth(d.getMonth()) }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 font-bold text-lg">
                ›
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {days.map(d => (
                <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
              ))}
            </div>

            {/* Date Cells */}
            <div className="grid grid-cols-7 gap-1">
              {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
              {Array(daysInMonth).fill(null).map((_, i) => {
                const day = i + 1
                const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const isToday = dateKey === today.toISOString().split('T')[0]
                const isSelected = dateKey === selectedDate
                const info = monthData[dateKey]
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`relative h-10 flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-colors
                      ${info?.isLeave && !isSelected ? 'bg-red-100 text-red-700' : ''}
                      ${isSelected ? '!bg-teal-600 !text-white' : ''}
                      ${isToday && !isSelected ? 'border-2 border-teal-500 text-teal-700' : ''}
                      ${!info?.isLeave && !isSelected ? 'hover:bg-gray-100 text-gray-700' : ''}`}>
                    {day}
                    {info?.consultationCount > 0 && !isSelected && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 bg-teal-500 rounded-full" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-red-100 inline-block" /> Unavailable
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" /> Has consultations
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm border-2 border-teal-500 inline-block" /> Today
              </span>
            </div>
          </div>

          {/* Selected Day Consultations */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-5 py-4 border-b">
              <h3 className="font-semibold text-gray-800">
                Consultations on {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
            </div>
            <div className="divide-y">
              {consultations.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <CalendarDays size={32} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No consultations on this day</p>
                </div>
              ) : (
                consultations.map(c => (
                  <div key={c.id} className="px-5 py-3 flex items-center gap-4">
                    <div className="w-16 text-center flex-shrink-0">
                      <p className="text-sm font-bold text-teal-700">{c.time}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={15} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{c.user?.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.type === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {c.type}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      c.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      c.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      c.status === 'ACCEPTED' ? 'bg-teal-100 text-teal-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{c.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Mark Unavailability */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Plus size={16} className="text-teal-600" /> Mark Unavailability
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Reason (optional)</label>
                <input type="text" placeholder="e.g. Out of town, Conference..." value={reason} onChange={e => setReason(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <button onClick={addLeave}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
                Mark Unavailable
              </button>
            </div>
          </div>

          {/* Existing Leaves */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Upcoming Unavailability</h3>
            <div className="space-y-2">
              {leaves.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No leaves marked</p>
              ) : (
                leaves.map(l => (
                  <div key={l.id} className="flex items-start justify-between bg-red-50 rounded-lg p-3">
                    <div>
                      <p className="text-xs font-medium text-red-700">
                        {new Date(l.startDate).toLocaleDateString('en-IN')} → {new Date(l.endDate).toLocaleDateString('en-IN')}
                      </p>
                      {l.reason && <p className="text-xs text-red-500 mt-0.5">{l.reason}</p>}
                    </div>
                    <button onClick={() => deleteLeave(l.id)} className="text-red-400 hover:text-red-600 flex-shrink-0 ml-2">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
