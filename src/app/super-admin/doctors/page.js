'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Eye, ToggleLeft, ToggleRight, Stethoscope } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SuperAdminDoctorsPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState([])
  const [stats, setStats] = useState({})
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // ✅ useCallback so useEffect dependency is stable
  const load = useCallback(async () => {
    const query = new URLSearchParams()          // ✅ renamed from 'params' to 'query'
    if (search) query.set('search', search)
    if (statusFilter) query.set('status', statusFilter)
    try {
      const res = await fetch(`/api/super-admin/doctors?${query}`)
      const data = await res.json()
      setDoctors(data.doctors || [])
      setStats(data.stats || {})
    } catch (err) {
      console.error('LOAD ERROR:', err)
    }
  }, [search, statusFilter])

  useEffect(() => { load() }, [load])

  const toggleStatus = async (id, current) => {
    const newStatus = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await fetch('/api/super-admin/doctors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })
    toast.success(`Doctor ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`)
    load()
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">All Doctors</h2>
        <p className="text-sm text-gray-500 mt-0.5">Across all hospitals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Active', value: stats.active },
          { label: 'Inactive', value: stats.inactive },
          { label: 'Online Enabled', value: stats.online },
        ].map(({ label, value }) => (
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
          <input
            type="text"
            placeholder="Search by name, ID, specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <button
          onClick={() => { setSearch(''); setStatusFilter('') }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['#', 'Doctor', 'Hospital', 'Specializations', 'Fee', 'Online', 'Consultations', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {doctors.map((d, i) => (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                      <Stethoscope size={14} className="text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{d.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{d.doctorId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{d.hospital?.name}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {d.specializations?.slice(0, 2).map((s) => (
                      <span key={s} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">{s}</span>
                    ))}
                    {d.specializations?.length > 2 && (
                      <span className="text-xs text-gray-400">+{d.specializations.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-700">₹{d.consultationFee}</td>
                <td className="px-4 py-3 text-center">
                  {d.isOnlineConsultation
                    ? <span className="text-green-600 text-xs font-medium">✅ ₹{d.onlineConsultationFee}</span>
                    : <span className="text-gray-400 text-xs">—</span>}
                </td>
                <td className="px-4 py-3 text-center font-semibold text-gray-700">
                  {d._count?.consultations ?? 0}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                    ${d.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => router.push(`/super-admin/doctors/${d.id}`)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => toggleStatus(d.id, d.status)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-green-100 transition"
                    >
                      {d.status === 'ACTIVE'
                        ? <ToggleRight size={14} className="text-green-600" />
                        : <ToggleLeft size={14} className="text-gray-400" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-400">No doctors found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
