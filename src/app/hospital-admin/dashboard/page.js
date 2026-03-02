'use client'
import { useEffect, useState } from 'react'
import { CalendarCheck, CalendarDays, CheckCircle, XCircle, RefreshCw, Clock, HeartPulse } from 'lucide-react'

export default function HospitalAdminDashboard() {
  const [stats, setStats] = useState(null)
  const [todayConsultations, setTodayConsultations] = useState([])
  const [emergencies, setEmergencies] = useState([])

  useEffect(() => {
    fetch('/api/hospital-admin/dashboard')
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats)
        setTodayConsultations(data.todayConsultations)
        setEmergencies(data.emergencies)
      })
  }, [])

  const statCards = [
    { label: 'Total Consultations', value: stats?.total, icon: CalendarCheck, color: 'blue' },
    { label: 'Today', value: stats?.today, icon: CalendarDays, color: 'teal' },
    { label: 'Pending', value: stats?.pending, icon: Clock, color: 'yellow' },
    { label: 'Accepted', value: stats?.accepted, icon: CheckCircle, color: 'green' },
    { label: 'Completed', value: stats?.completed, icon: CheckCircle, color: 'emerald' },
    { label: 'Cancelled', value: stats?.cancelled, icon: XCircle, color: 'red' },
    { label: 'Rescheduled', value: stats?.rescheduled, icon: RefreshCw, color: 'purple' },
    { label: 'Active Emergencies', value: stats?.activeEmergencies, icon: HeartPulse, color: 'orange' },
  ]

  const colorMap = {
    blue: 'bg-blue-50 border-blue-200',
    teal: 'bg-teal-50 border-teal-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    red: 'bg-red-50 border-red-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
  }

  const iconBg = {
    blue: 'bg-blue-100 text-blue-600',
    teal: 'bg-teal-100 text-teal-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  const statusColors = {
    COMPLETED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    ACCEPTED: 'bg-teal-100 text-teal-700',
    CANCELLED: 'bg-red-100 text-red-700',
    RESCHEDULED: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Your hospital's overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`bg-white rounded-xl border p-5 hover:shadow-md transition ${colorMap[color]}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${iconBg[color]}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{value ?? '...'}</p>
            <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Consultations */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Today's Consultations</h3>
            <a href="/hospital-admin/consultations" className="text-xs text-blue-600 hover:underline">View all</a>
          </div>
          <div className="divide-y">
            {todayConsultations.map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{c.user?.name}</p>
                  <p className="text-xs text-gray-400">
                    Dr. {c.doctor?.name} · {c.time}
                    {c.type === 'ONLINE' && <span className="ml-1 text-blue-500">🌐</span>}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[c.status]}`}>
                  {c.status}
                </span>
              </div>
            ))}
            {todayConsultations.length === 0 && (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">No consultations today</p>
            )}
          </div>
        </div>

        {/* Active Emergencies */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <HeartPulse size={16} className="text-red-500" /> Active Emergencies
            </h3>
            <a href="/hospital-admin/emergency" className="text-xs text-blue-600 hover:underline">View all</a>
          </div>
          <div className="divide-y">
            {emergencies.map((e) => (
              <div key={e.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-800">{e.patientName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${e.status === 'PENDING' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {e.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400">📞 {e.phone}</p>
                {e.locationText && <p className="text-xs text-gray-400">📍 {e.locationText}</p>}
              </div>
            ))}
            {emergencies.length === 0 && (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">No active emergencies</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
