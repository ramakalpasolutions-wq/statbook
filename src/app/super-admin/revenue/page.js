'use client'
import { useEffect, useState } from 'react'
import { DollarSign, CheckCircle, Clock, Calendar, Download, Printer } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RevenuePage() {
  const [stats, setStats] = useState({})
  const [settlements, setSettlements] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => { loadRevenue() }, [filter, search])

  const loadRevenue = async () => {
    const params = new URLSearchParams()
    if (filter !== 'ALL') params.set('status', filter)
    if (search) params.set('search', search)
    const res = await fetch(`/api/super-admin/revenue?${params}`)
    const data = await res.json()
    setStats(data.stats || {})
    setSettlements(data.settlements || [])
  }

  const markSettled = async (id) => {
    await fetch('/api/super-admin/revenue', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'SETTLED' }),
    })
    toast.success('Settlement marked as settled!')
    loadRevenue()
  }

  const exportCSV = () => {
    const headers = ['Hospital', 'Week Start', 'Week End', 'Total Revenue', 'Commission', 'Payable', 'Status', 'Settled At']
    const rows = settlements.map((s) => [
      s.hospital?.name,
      new Date(s.weekStart).toLocaleDateString('en-IN'),
      new Date(s.weekEnd).toLocaleDateString('en-IN'),
      s.totalRevenue, s.commission, s.payable, s.status,
      s.settledAt ? new Date(s.settledAt).toLocaleDateString('en-IN') : '—',
    ].join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'settlements.csv'; a.click()
  }

  const statCards = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue?.toLocaleString() ?? 0}`, icon: DollarSign, color: 'green' },
    { label: 'This Week', value: `₹${stats.weekRevenue?.toLocaleString() ?? 0}`, icon: Calendar, color: 'blue' },
    { label: 'Pending Payable', value: `₹${stats.pendingPayable?.toLocaleString() ?? 0}`, icon: Clock, color: 'orange' },
    { label: 'Total Settled', value: `₹${stats.settledAmount?.toLocaleString() ?? 0}`, icon: CheckCircle, color: 'teal' },
  ]

  const colorMap = {
    green: 'bg-green-50 border-green-200 text-green-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Revenue & Settlements</h2>
          <p className="text-sm text-gray-500 mt-0.5">Weekly Sun–Sat settlement cycle</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Printer size={14} /> Print
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-xl border p-5 ${colorMap[color]}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} />
              <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Settlement Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Calendar size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Settlement Cycle</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Revenue collected from <strong>Sunday to Saturday</strong> is settled on the <strong>following Sunday</strong>.
            Last settlement: <strong>{stats.lastSettledDate ? new Date(stats.lastSettledDate).toLocaleDateString('en-IN') : 'N/A'}</strong>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <input type="text" placeholder="Search hospital name..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div className="flex gap-2">
          {['ALL', 'UNSETTLED', 'SETTLED'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition
                ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['S.No', 'Hospital', 'Week', 'Total Revenue', 'Commission (20%)', 'Payable', 'Status', 'Last Settled', 'Action'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {settlements.map((s, i) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 font-semibold text-gray-800">{s.hospital?.name}</td>
                <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                  {new Date(s.weekStart).toLocaleDateString('en-IN')} – {new Date(s.weekEnd).toLocaleDateString('en-IN')}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">₹{s.totalRevenue.toLocaleString()}</td>
                <td className="px-4 py-3 text-orange-600 font-medium">₹{s.commission.toLocaleString()}</td>
                <td className="px-4 py-3 text-green-700 font-bold">₹{s.payable.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                    ${s.status === 'SETTLED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {s.settledAt ? new Date(s.settledAt).toLocaleDateString('en-IN') : '—'}
                </td>
                <td className="px-4 py-3">
                  {s.status === 'UNSETTLED' ? (
                    <button onClick={() => markSettled(s.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">
                      Mark Settled
                    </button>
                  ) : (
                    <span className="text-green-600 text-xs flex items-center gap-1">
                      <CheckCircle size={12} /> Settled
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {settlements.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">No settlement records found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
