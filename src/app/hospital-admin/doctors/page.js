'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Eye, ToggleLeft, ToggleRight, Stethoscope } from 'lucide-react'
import toast from 'react-hot-toast'

export default function HospitalDoctorsPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState([])
  const [stats, setStats] = useState({})
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { load() }, [search, statusFilter])

  const load = async () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/hospital-admin/doctors?${params}`)
    const data = await res.json()
    setDoctors(data.doctors || [])
    setStats(data.stats || {})
  }

  const toggleStatus = async (id, current) => {
    const newStatus = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await fetch('/api/hospital-admin/doctors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })
    toast.success(`Doctor marked ${newStatus}`)
    load()
  }

  const statCards = [
    { label: 'Total Doctors', value: stats.total },
    { label: 'Active', value: stats.active },
    { label: 'Inactive', value: stats.inactive },
    { label: 'Online Enabled', value: stats.online },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Doctors</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your hospital's doctors</p>
        </div>
        <button onClick={() => router.push('/hospital-admin/doctors/add')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          <Plus size={15} /> Add Doctor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-800">{value ?? '...'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, ID, specialization..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <button onClick={() => { setSearch(''); setStatusFilter('') }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
          Reset
        </button>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {doctors.map((d) => (
          <div key={d.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
            {/* Top Row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Stethoscope size={22} className="text-teal-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{d.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{d.doctorId}</p>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0
                ${d.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {d.status}
              </span>
            </div>

            {/* Specializations */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {d.specializations?.map((s) => (
                <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                  {s}
                </span>
              ))}
            </div>

            {/* Info Row */}
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-sm font-bold text-gray-800">{d.experience}</p>
                <p className="text-xs text-gray-400">Yrs Exp</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-sm font-bold text-gray-800">₹{d.consultationFee}</p>
                <p className="text-xs text-gray-400">Fee</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-sm font-bold text-gray-800">{d._count?.consultations ?? 0}</p>
                <p className="text-xs text-gray-400">Consults</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {d.isOnlineConsultation && (
                <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                  🌐 Online ₹{d.onlineConsultationFee}
                </span>
              )}
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {d.availabilityType === 'FULL_DAY' ? `🕐 ${d.startTime}–${d.endTime}` : '🕐 Time Slots'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button onClick={() => router.push(`/hospital-admin/doctors/${d.id}`)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-xs font-medium transition">
                <Eye size={13} /> View
              </button>
              <button onClick={() => router.push(`/hospital-admin/doctors/${d.id}/edit`)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 py-2 rounded-lg text-xs font-medium transition">
                ✏️ Edit
              </button>
              <button onClick={() => router.push(`/hospital-admin/doctors/${d.id}/calendar`)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 py-2 rounded-lg text-xs font-medium transition">
                📅 Calendar
              </button>
              <button onClick={() => toggleStatus(d.id, d.status)}
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-xs transition">
                {d.status === 'ACTIVE'
                  ? <ToggleRight size={16} className="text-green-600" />
                  : <ToggleLeft size={16} className="text-gray-400" />}
              </button>
            </div>
          </div>
        ))}
        {doctors.length === 0 && (
          <div className="col-span-3 bg-white rounded-xl border border-gray-100 py-16 text-center">
            <Stethoscope size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No doctors found</p>
            <button onClick={() => router.push('/hospital-admin/doctors/add')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Add First Doctor
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
