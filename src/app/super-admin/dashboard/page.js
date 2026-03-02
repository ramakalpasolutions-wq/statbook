'use client'
import { useEffect, useState } from 'react'
import { Hospital, CalendarCheck, CalendarDays, CheckCircle, XCircle, RefreshCw, TrendingUp, Users, Stethoscope } from 'lucide-react'

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentHospitals, setRecentHospitals] = useState([])
  const [recentConsultations, setRecentConsultations] = useState([])

  useEffect(() => {
    fetch('/api/super-admin/dashboard')
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats)
        setRecentHospitals(data.recentHospitals)
        setRecentConsultations(data.recentConsultations)
      })
  }, [])

  const statCards = [
    { label: 'Total Hospitals', value: stats?.totalHospitals, icon: Hospital, color: 'blue', sub: `${stats?.activeHospitals} Active` },
    { label: 'Total Doctors', value: stats?.totalDoctors, icon: Stethoscope, color: 'teal', sub: `Across all hospitals` },
    { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'purple', sub: `Registered users` },
    { label: 'This Month', value: stats?.monthConsultations, icon: CalendarCheck, color: 'green', sub: `Consultations` },
    { label: 'Today', value: stats?.todayConsultations, icon: CalendarDays, color: 'orange', sub: `Consultations` },
    { label: 'Accepted', value: stats?.accepted, icon: CheckCircle, color: 'emerald', sub: `Total accepted` },
    { label: 'Declined', value: stats?.cancelled, icon: XCircle, color: 'red', sub: `Total cancelled` },
    { label: 'Rescheduled', value: stats?.rescheduled, icon: RefreshCw, color: 'yellow', sub: `Total rescheduled` },
  ]

  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  }

  const iconBg = {
    blue: 'bg-blue-100 text-blue-600',
    teal: 'bg-teal-100 text-teal-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
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
        <p className="text-gray-500 text-sm mt-1">Overview of all STAT BOOK activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label}
            className={`bg-white rounded-xl border p-5 hover:shadow-md transition cursor-default ${colorMap[color]}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${iconBg[color]}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{value ?? '...'}</p>
            <p className="text-sm font-semibold text-gray-700 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Hospitals */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Recent Hospitals</h3>
            <a href="/super-admin/hospitals" className="text-xs text-blue-600 hover:underline">View all</a>
          </div>
          <div className="divide-y">
            {recentHospitals.map((h) => (
              <div key={h.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{h.name}</p>
                  <p className="text-xs text-gray-400">{h.city}, {h.state} · {h.type}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                  ${h.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    h.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'}`}>
                  {h.status}
                </span>
              </div>
            ))}
            {recentHospitals.length === 0 && (
              <p className="px-5 py-6 text-center text-gray-400 text-sm">No hospitals yet</p>
            )}
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Recent Consultations</h3>
            <a href="/super-admin/users" className="text-xs text-blue-600 hover:underline">View all</a>
          </div>
          <div className="divide-y">
            {recentConsultations.map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{c.user?.name}</p>
                  <p className="text-xs text-gray-400">
                    Dr. {c.doctor?.name} · {new Date(c.date).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[c.status]}`}>
                  {c.status}
                </span>
              </div>
            ))}
            {recentConsultations.length === 0 && (
              <p className="px-5 py-6 text-center text-gray-400 text-sm">No consultations yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
