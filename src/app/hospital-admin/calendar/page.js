'use client'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, User, Stethoscope, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarPage() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0])
  const [consultations, setConsultations] = useState([])
  const [monthData, setMonthData] = useState({}) // date -> count
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, completed: 0, cancelled: 0, pending: 0 })

  // Load month overview
  useEffect(() => {
    loadMonthData()
  }, [currentYear, currentMonth])

  // Load selected day consultations
  useEffect(() => {
    loadDayConsultations()
  }, [selectedDate])

  const loadMonthData = async () => {
    const from = new Date(currentYear, currentMonth, 1).toISOString()
    const to = new Date(currentYear, currentMonth + 1, 0).toISOString()
    const res = await fetch(`/api/hospital-admin/calendar?from=${from}&to=${to}`)
    const data = await res.json()

    // Group by date
    const grouped = {}
    data.forEach((c) => {
      const dateKey = new Date(c.date).toISOString().split('T')[0]
      grouped[dateKey] = (grouped[dateKey] || 0) + 1
    })
    setMonthData(grouped)
  }

  const loadDayConsultations = async () => {
    setLoading(true)
    const res = await fetch(`/api/hospital-admin/consultation?date=${selectedDate}`)
    const data = await res.json()
    setConsultations(data)

    // Compute stats
    setStats({
      total: data.length,
      completed: data.filter((c) => c.status === 'COMPLETED').length,
      cancelled: data.filter((c) => c.status === 'CANCELLED').length,
      pending: data.filter((c) => c.status === 'PENDING').length,
    })
    setLoading(false)
  }

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) }
    else setCurrentMonth(currentMonth - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) }
    else setCurrentMonth(currentMonth + 1)
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const statusConfig = {
    COMPLETED: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    CANCELLED: { color: 'bg-red-100 text-red-700', icon: XCircle },
    RESCHEDULED: { color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
    PENDING: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    ACCEPTED: { color: 'bg-teal-100 text-teal-700', icon: CheckCircle },
  }

  const cancellationRules = [
    { rule: 'Cancelled before 24 hours', fee: '20% cancellation fee applied', color: 'yellow' },
    { rule: 'After doctor accepted & session started', fee: 'No refund', color: 'red' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Calendar</h2>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT — Calendar Grid */}
        <div className="xl:col-span-2 space-y-4">

          {/* Mini Stats for Selected Day */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { label: 'Completed', value: stats.completed, color: 'bg-green-50 text-green-700 border-green-200' },
              { label: 'Pending', value: stats.pending, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
              { label: 'Cancelled', value: stats.cancelled, color: 'bg-red-50 text-red-700 border-red-200' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl border p-3 text-center ${color}`}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ChevronLeft size={18} className="text-gray-600" />
              </button>
              <h3 className="font-bold text-gray-800 text-lg">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 mb-2">
              {dayNames.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for first day offset */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const isToday = dateStr === today.toISOString().split('T')[0]
                const isSelected = dateStr === selectedDate
                const count = monthData[dateStr] || 0

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition
                      ${isSelected ? 'bg-teal-600 text-white shadow-md' :
                        isToday ? 'bg-teal-50 text-teal-700 border-2 border-teal-300' :
                        'hover:bg-gray-50 text-gray-700'}`}
                  >
                    {day}
                    {count > 0 && (
                      <span className={`text-xs font-bold leading-none mt-0.5
                        ${isSelected ? 'text-teal-100' : 'text-teal-600'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Day Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                Schedule for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </h3>
              <span className="text-xs text-gray-400">{consultations.length} appointments</span>
            </div>

            <div className="divide-y">
              {loading ? (
                <div className="px-5 py-10 text-center text-gray-400 text-sm">Loading...</div>
              ) : consultations.length === 0 ? (
                <div className="px-5 py-10 text-center text-gray-400 text-sm">No appointments for this day</div>
              ) : (
                consultations.map((c) => {
                  const cfg = statusConfig[c.status] || { color: 'bg-gray-100 text-gray-700', icon: Clock }
                  const StatusIcon = cfg.icon
                  return (
                    <div key={c.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                      {/* Time */}
                      <div className="w-16 text-center flex-shrink-0">
                        <p className="text-sm font-bold text-teal-700">{c.time}</p>
                      </div>

                      {/* Line */}
                      <div className="w-0.5 h-10 bg-teal-200 flex-shrink-0" />

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User size={13} className="text-gray-400" />
                          <p className="text-sm font-semibold text-gray-800">{c.user?.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stethoscope size={13} className="text-gray-400" />
                          <p className="text-xs text-gray-500">Dr. {c.doctor?.name}</p>
                        </div>
                        {c.cancelledBy && (
                          <p className="text-xs text-red-400 mt-1">Cancelled by {c.cancelledBy}</p>
                        )}
                        {c.rescheduledBy && (
                          <p className="text-xs text-blue-400 mt-1">Rescheduled by {c.rescheduledBy}</p>
                        )}
                      </div>

                      {/* Fee */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-700">₹{c.fee}</p>
                      </div>

                      {/* Status */}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 flex-shrink-0 ${cfg.color}`}>
                        <StatusIcon size={11} />
                        {c.status}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-4">

          {/* Notification Rules */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">📲 Notifications Sent For</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Booking confirmation', color: 'bg-teal-500' },
                { label: 'Doctor acceptance', color: 'bg-green-500' },
                { label: 'Cancellation', color: 'bg-red-500' },
                { label: 'Rescheduling', color: 'bg-blue-500' },
                { label: 'Reminder 1 hour before', color: 'bg-yellow-500' },
              ].map(({ label, color }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
                  {label}
                </li>
              ))}
            </ul>
            <div className="mt-4 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
              <p className="text-xs text-teal-700 font-medium">📱 SMS via Twilio + 📧 Email via Gmail</p>
            </div>
          </div>

          {/* Cancellation Rules */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">❌ Cancellation Rules</h3>
            <div className="space-y-3">
              {cancellationRules.map(({ rule, fee, color }) => (
                <div key={rule} className={`rounded-lg p-3 border
                  ${color === 'red' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <p className={`text-xs font-semibold ${color === 'red' ? 'text-red-800' : 'text-yellow-800'}`}>{rule}</p>
                  <p className={`text-xs mt-1 ${color === 'red' ? 'text-red-600' : 'text-yellow-600'}`}>{fee}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">📊 This Month</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total appointments</span>
                <span className="font-bold text-gray-800">
                  {Object.values(monthData).reduce((a, b) => a + b, 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active days</span>
                <span className="font-bold text-gray-800">
                  {Object.keys(monthData).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Busiest day</span>
                <span className="font-bold text-teal-700 text-xs">
                  {Object.keys(monthData).length > 0
                    ? new Date(Object.entries(monthData).sort((a, b) => b[1] - a[1])[0][0] + 'T00:00:00')
                        .toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
