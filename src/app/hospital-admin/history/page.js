'use client'
import { useEffect, useState } from 'react'
import { Activity, DollarSign, Calendar, Clock, AlertCircle } from 'lucide-react'

export default function HistoryPage() {
  const [stats, setStats] = useState({})
  const [records, setRecords] = useState([])
  const [filters, setFilters] = useState({ doctor: '', from: '', to: '', search: '' })
  const [doctors, setDoctors] = useState([])

  useEffect(() => {
    fetch('/api/hospital-admin/doctors').then((r) => r.json()).then(setDoctors)
    loadStats()
  }, [])

  useEffect(() => { loadHistory() }, [filters])

  const loadStats = async () => {
    const res = await fetch('/api/hospital-admin/history?type=stats')
    const data = await res.json()
    setStats(data)
  }

  const loadHistory = async () => {
    const params = new URLSearchParams()
    params.set('type', 'records')
    if (filters.doctor) params.set('doctor', filters.doctor)
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    if (filters.search) params.set('search', filters.search)
    const res = await fetch(`/api/hospital-admin/history?${params}`)
    const data = await res.json()
    setRecords(data)
  }

  const resetFilters = () => setFilters({ doctor: '', from: '', to: '', search: '' })

  const statCards = [
    { label: 'Total Consultations', value: stats.totalConsultations, icon: Activity, color: 'blue' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue?.toLocaleString() ?? 0}`, icon: DollarSign, color: 'green' },
    { label: 'This Month Revenue', value: `₹${stats.monthRevenue?.toLocaleString() ?? 0}`, icon: Calendar, color: 'purple' },
    { label: 'Today Consultations', value: stats.todayConsultations, icon: Clock, color: 'teal' },
    { label: 'Pending Revenue', value: `₹${stats.pendingRevenue?.toLocaleString() ?? 0}`, icon: AlertCircle, color: 'orange' },
  ]

  const colorMap = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    teal: 'bg-teal-100 text-teal-700',
    orange: 'bg-orange-100 text-orange-700',
  }

  const statusColors = {
    COMPLETED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    CANCELLED: 'bg-red-100 text-red-700',
    RESCHEDULED: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">History</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition">
            <div className={`w-10 h-10 rounded-full ${colorMap[color]} flex items-center justify-center mb-3`}>
              <Icon size={18} />
            </div>
            <p className="text-gray-500 text-xs">{label}</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{value ?? '...'}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <select value={filters.doctor} onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">All Doctors</option>
          {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
        </select>
        <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <span className="text-gray-400 text-sm">to</span>
        <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <input type="text" placeholder="Search name / phone..." value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <button onClick={resetFilters}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition">
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['S.No', 'Doctor Name', 'User Name', 'Consultation Date', 'Phone', 'Status'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-800">Dr. {r.doctor?.name}</td>
                <td className="px-4 py-3 text-gray-700">{r.user?.name}</td>
                <td className="px-4 py-3 text-gray-600">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3 text-gray-600">{r.user?.phone}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status] || 'bg-gray-100 text-gray-600'}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No history records found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
