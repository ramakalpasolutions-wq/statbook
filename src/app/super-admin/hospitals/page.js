'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Upload, Printer, Download, ChevronUp, ChevronDown, Eye, Edit, ToggleLeft, ToggleRight, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

export default function HospitalsPage() {
  const router = useRouter()
  const [hospitals, setHospitals] = useState([])
  const [stats, setStats] = useState({})
  const [filters, setFilters] = useState({ search: '', state: '', district: '', city: '', type: '', status: '' })
  const [sort, setSort] = useState({ field: 'createdAt', dir: 'desc' })
  const [showFilters, setShowFilters] = useState(false)
  const printRef = useRef()

  useEffect(() => { loadHospitals() }, [filters, sort])

  const loadHospitals = async () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    params.set('sortField', sort.field)
    params.set('sortDir', sort.dir)
    const res = await fetch(`/api/super-admin/hospitals?${params}`)
    const data = await res.json()
    setHospitals(data.hospitals || [])
    setStats(data.stats || {})
  }

  const toggleStatus = async (id, current) => {
    const newStatus = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await fetch('/api/super-admin/hospitals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })
    toast.success(`Hospital marked ${newStatus}`)
    loadHospitals()
  }

  const handleSort = (field) => {
    setSort((prev) => ({ field, dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc' }))
  }

  const exportCSV = () => {
    const headers = ['S.No', 'Hospital ID', 'Name', 'Type', 'City', 'State', 'Phone', 'Email', 'Status']
    const rows = hospitals.map((h, i) =>
      [i + 1, h.hospitalId, h.name, h.type, h.city, h.state, h.phone, h.email, h.status].join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'hospitals.csv'; a.click()
  }

  const handlePrint = () => window.print()

  const SortIcon = ({ field }) => {
    if (sort.field !== field) return <ChevronUp size={12} className="text-gray-300" />
    return sort.dir === 'asc'
      ? <ChevronUp size={12} className="text-blue-600" />
      : <ChevronDown size={12} className="text-blue-600" />
  }

  const statCards = [
    { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Active', value: stats.active, color: 'bg-green-50 text-green-700 border-green-200' },
    { label: 'Pending', value: stats.pending, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { label: 'Inactive', value: stats.inactive, color: 'bg-red-50 text-red-700 border-red-200' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hospitals</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage all registered hospitals</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push('/super-admin/hospitals/bulk')}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition">
            <Upload size={15} /> Bulk Upload
          </button>
          <button onClick={() => router.push('/super-admin/hospitals/add')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            <Plus size={15} /> Add Hospital
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl border p-4 text-center ${color}`}>
            <p className="text-2xl font-bold">{value ?? '...'}</p>
            <p className="text-xs font-medium mt-0.5">{label} Hospitals</p>
          </div>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-48 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name, ID, email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Filter size={14} /> Filters
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Printer size={14} /> Print
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Download size={14} /> Export
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2 border-t border-gray-100">
            {[
              { key: 'state', placeholder: 'State' },
              { key: 'district', placeholder: 'District' },
              { key: 'city', placeholder: 'City' },
            ].map(({ key, placeholder }) => (
              <input key={key} type="text" placeholder={placeholder}
                value={filters[key]}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            ))}
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Types</option>
              <option value="MULTI_SPECIALITY">Multi Speciality</option>
              <option value="NORMAL">Normal</option>
              <option value="CLINIC">Clinic</option>
            </select>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <button onClick={() => setFilters({ search: '', state: '', district: '', city: '', type: '', status: '' })}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm">
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto" ref={printRef}>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                { label: 'S.No', field: null },
                { label: 'Hospital ID', field: 'hospitalId' },
                { label: 'Hospital Name', field: 'name' },
                { label: 'Type', field: 'type' },
                { label: 'City', field: 'city' },
                { label: 'Consultations', field: null },
                { label: 'Today', field: null },
                { label: 'Accepted', field: null },
                { label: 'Declined', field: null },
                { label: 'Rescheduled', field: null },
                { label: 'Status', field: 'status' },
                { label: 'Actions', field: null },
              ].map(({ label, field }) => (
                <th key={label}
                  onClick={() => field && handleSort(field)}
                  className={`text-left px-4 py-3 text-gray-600 font-medium whitespace-nowrap
                    ${field ? 'cursor-pointer hover:text-blue-600 select-none' : ''}`}>
                  <div className="flex items-center gap-1">
                    {label}
                    {field && <SortIcon field={field} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hospitals.map((h, i) => (
              <tr key={h.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{h.hospitalId}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-semibold text-gray-800">{h.name}</p>
                    <p className="text-xs text-gray-400">{h.city}, {h.state}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium
                    ${h.type === 'MULTI_SPECIALITY' ? 'bg-blue-100 text-blue-700' :
                      h.type === 'CLINIC' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'}`}>
                    {h.type.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{h.city}</td>
                <td className="px-4 py-3 text-center font-semibold text-gray-700">{h._count?.consultations ?? 0}</td>
                <td className="px-4 py-3 text-center text-gray-600">{h.todayCount ?? 0}</td>
                <td className="px-4 py-3 text-center text-green-600 font-medium">{h.acceptedCount ?? 0}</td>
                <td className="px-4 py-3 text-center text-red-600 font-medium">{h.declinedCount ?? 0}</td>
                <td className="px-4 py-3 text-center text-blue-600 font-medium">{h.rescheduledCount ?? 0}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                    ${h.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      h.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'}`}>
                    {h.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => router.push(`/super-admin/hospitals/${h.id}`)}
                      title="View"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => router.push(`/super-admin/hospitals/${h.id}/edit`)}
                      title="Edit"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-yellow-100 hover:text-yellow-600 transition">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => toggleStatus(h.id, h.status)}
                      title={h.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-green-100 hover:text-green-600 transition">
                      {h.status === 'ACTIVE'
                        ? <ToggleRight size={14} className="text-green-600" />
                        : <ToggleLeft size={14} className="text-gray-400" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {hospitals.length === 0 && (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-gray-400">
                  No hospitals found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
