'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function UserDetailPage() {
  const { userId } = useParams()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({})

  useEffect(() => {
    fetch(`/api/super-admin/users/${userId}`)
      .then((r) => r.json())
      .then((d) => { setUser(d.user); setStats(d.stats) })
  }, [userId])

  if (!user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  )

  const statusColors = {
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    RESCHEDULED: 'bg-blue-100 text-blue-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    ACCEPTED: 'bg-teal-100 text-teal-700',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
        <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium
          ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {user.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Consultations', value: stats.total },
          { label: 'Completed', value: stats.completed },
          { label: 'Cancelled', value: stats.cancelled },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-800">{value ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">User Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Email', user.email],
                ['Phone', user.phone],
                ['Address', user.address || '—'],
                ['Location', user.location || '—'],
                ['Email Verified', user.emailVerified ? '✅ Yes' : '❌ No'],
                ['Phone Verified', user.phoneVerified ? '✅ Yes' : '❌ No'],
                ['Joined', new Date(user.createdAt).toLocaleDateString('en-IN')],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-medium text-gray-700">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Consultation History */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <div className="px-5 py-4 border-b">
              <h3 className="font-semibold text-gray-800">Consultation History</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Doctor', 'Hospital', 'Date', 'Type', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {user.consultations?.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{c.doctor?.name}</p>
                      <p className="text-xs text-gray-400">{c.doctor?.specializations?.[0]}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.hospital?.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {new Date(c.date).toLocaleDateString('en-IN')} · {c.time}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${c.type === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {c.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Family Members */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Family Members ({user.familyMembers?.length})</h3>
          <div className="space-y-3">
            {user.familyMembers?.map((f) => (
              <div key={f.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-800">{f.name}</p>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{f.relation}</span>
                </div>
                {f.age && <p className="text-xs text-gray-500">Age: {f.age}</p>}
                {f.bloodGroup && <p className="text-xs text-gray-500">Blood: {f.bloodGroup}</p>}
                {f.phone && <p className="text-xs text-gray-500">📞 {f.phone}</p>}
              </div>
            ))}
            {user.familyMembers?.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No family members</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
