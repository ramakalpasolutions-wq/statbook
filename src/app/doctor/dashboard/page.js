'use client'
import { useEffect, useState } from 'react'
import { Stethoscope, CalendarDays, Clock, User, Video } from 'lucide-react'

export default function DoctorDashboard() {
  const [stats, setStats] = useState({})
  const [upcoming, setUpcoming] = useState([])

  useEffect(() => {
  fetch('/api/doctor/dashboard')
    .then(r => {
      if (!r.ok) throw new Error('Failed')
      return r.json()
    })
    .then(d => {
      setStats(d.stats || {})
      setUpcoming(d.upcoming || [])
    })
    .catch(err => console.error('Dashboard error:', err))
}, [])


  const statCards = [
    { label: 'Total Consultations', value: stats.total, icon: Stethoscope, color: 'teal' },
    { label: 'This Month', value: stats.thisMonth, icon: CalendarDays, color: 'blue' },
    { label: 'Today', value: stats.today, icon: Clock, color: 'purple' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back, Doctor</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 bg-${color}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
              <Icon size={22} className={`text-${color}-600`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{value ?? '...'}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Online Consultations */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <Video size={18} className="text-teal-600" />
          <h3 className="font-semibold text-gray-800">Upcoming Consultations Today</h3>
        </div>
        <div className="divide-y">
          {upcoming.length === 0 && (
            <div className="px-5 py-10 text-center">
              <CalendarDays size={36} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No upcoming consultations today</p>
            </div>
          )}
          {upcoming.map(c => (
            <div key={c.id} className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{c.user?.name}</p>
                  <p className="text-xs text-gray-400">{c.user?.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-teal-700">{c.time}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.type === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{c.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
