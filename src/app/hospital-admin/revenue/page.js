'use client'
import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default function HospitalAdminRevenuePage() {
  const [stats, setStats] = useState({})
  const [revenue, setRevenue] = useState([])
  const [settlements, setSettlements] = useState([])
  const [tab, setTab] = useState('revenue')

  useEffect(() => { load() }, [tab])

  const load = async () => {
    const res = await fetch('/api/hospital-admin/revenue')
    const data = await res.json()
    setStats(data.stats || {})
    setRevenue(data.revenue || [])
    setSettlements(data.settlements || [])
  }

  const statCards = [
    { label: 'Total Revenue', value: `₹${stats.total?.toLocaleString() ?? 0}`, icon: DollarSign, color: 'green' },
    { label: 'This Week', value: `₹${stats.thisWeek?.toLocaleString() ?? 0}`, icon: TrendingUp, color: 'blue' },
    { label: 'Pending Payable', value: `₹${stats.pendingPayable?.toLocaleString() ?? 0}`, icon: Clock, color: 'orange' },
    { label: 'Total Settled', value: `₹${stats.settled?.toLocaleString() ?? 0}`, icon: CheckCircle, color: 'teal' },
  ]

  const colorMap = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    orange: 'bg-orange-50 border-orange-200',
    teal: 'bg-teal-50 border-teal-200',
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Revenue</h2>
        <p className="text-sm text-gray-500 mt-0.5">Weekly settlement cycle (Sun–Sat)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-xl border p-5 bg-white ${colorMap[color]}`}>
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              <Icon size={16} />
              <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {['revenue', 'settlements'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition
              ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Revenue Table */}
      {tab === 'revenue' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['#', 'Consultation ID', 'Doctor', 'Date', 'Total', 'Commission', 'Payable', 'Week'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {revenue.map((r, i) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.consultation?.consultationId}</td>
                  <td className="px-4 py-3 font-medium text-gray-700">{r.doctor?.name}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {r.weekStart ? new Date(r.weekStart).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">₹{r.totalRevenue}</td>
                  <td className="px-4 py-3 text-orange-600">₹{r.commission}</td>
                  <td className="px-4 py-3 text-green-700 font-bold">₹{r.payable}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {r.weekStart && r.weekEnd
                      ? `${new Date(r.weekStart).toLocaleDateString('en-IN')} – ${new Date(r.weekEnd).toLocaleDateString('en-IN')}`
                      : '—'}
                  </td>
                </tr>
              ))}
              {revenue.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No revenue records</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Settlements Table */}
      {tab === 'settlements' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['#', 'Week', 'Total Revenue', 'Commission', 'Payable', 'Status', 'Settled At'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {settlements.map((s, i) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                    {new Date(s.weekStart).toLocaleDateString('en-IN')} – {new Date(s.weekEnd).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">₹{s.totalRevenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-orange-600">₹{s.commission.toLocaleString()}</td>
                  <td className="px-4 py-3 text-green-700 font-bold">₹{s.payable.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                      ${s.status === 'SETTLED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {s.settledAt ? new Date(s.settledAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                </tr>
              ))}
              {settlements.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No settlements yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
