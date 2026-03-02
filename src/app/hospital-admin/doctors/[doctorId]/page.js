'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Stethoscope, CalendarOff } from 'lucide-react'

const STATUS_COLORS = {
  COMPLETED:   'bg-green-100 text-green-700',
  PENDING:     'bg-yellow-100 text-yellow-700',
  ACCEPTED:    'bg-teal-100 text-teal-700',
  CANCELLED:   'bg-red-100 text-red-700',
  RESCHEDULED: 'bg-blue-100 text-blue-700',
}

export default function DoctorViewPage() {
  const { doctorId } = useParams()
  const router = useRouter()
  const [doctor, setDoctor] = useState(null)
  const [stats, setStats] = useState({})
  const [recentConsultations, setRecentConsultations] = useState([])

  useEffect(() => {
    fetch(`/api/hospital-admin/doctors/${doctorId}`)
      .then((r) => r.json())
      .then((d) => {
        setDoctor(d.doctor)
        setStats(d.stats)
        setRecentConsultations(d.recentConsultations || [])
      })
  }, [doctorId])

  if (!doctor) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{doctor.name}</h2>
            <p className="text-sm text-gray-500">{doctor.doctorId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push(`/hospital-admin/doctors/${doctorId}/edit`)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            ✏️ Edit
          </button>
          <button onClick={() => router.push(`/hospital-admin/doctors/${doctorId}/calendar`)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            <CalendarOff size={14} /> Calendar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',     value: stats.totalConsultations },
          { label: 'Today',     value: stats.todayConsultations },
          { label: 'Completed', value: stats.completed },
          { label: 'Cancelled', value: stats.cancelled },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-800">{value ?? 0}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Doctor Info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Stethoscope size={30} className="text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {doctor.specializations?.map((s) => (
                <span key={s} className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0
            ${doctor.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {doctor.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            ['Doctor ID',          doctor.doctorId],
            ['Experience',         `${doctor.experience} years`],
            ['Qualification',      doctor.qualification || '—'],
            ['Blood Group',        doctor.bloodGroup || '—'],
            ['Phone',              doctor.phone],
            ['Email',              doctor.email],
            ['Consultation Fee',   `₹${doctor.consultationFee}`],
            ['Online Consultation', doctor.isOnlineConsultation ? `✅ ₹${doctor.onlineConsultationFee}` : '❌ Not Available'],
            ['Availability',       doctor.availabilityType === 'FULL_DAY'
              ? `${doctor.startTime} – ${doctor.endTime}`
              : 'Time Slots'],
          ].map(([label, value]) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-medium text-gray-700 mt-0.5 text-sm break-all">{value}</p>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        {doctor.availabilityType === 'TIME_INTERVALS' && doctor.timeSlots && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-400 mb-2">Time Slots</p>
            <div className="flex flex-wrap gap-2">
              {doctor.timeSlots.map((s, i) => (
                <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium">
                  {s.startTime} – {s.endTime}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Address */}
        {doctor.address && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-400 mb-1">Address</p>
            <p className="text-sm text-gray-600">{doctor.address}</p>
          </div>
        )}
      </div>

      {/* Recent Consultations */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Recent Consultations</h3>
          <span className="text-xs text-gray-400">{recentConsultations.length} records</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Patient', 'Date', 'Time', 'Type', 'Status'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentConsultations.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-800">{c.user?.name}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(c.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-gray-600">{c.time}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${c.type === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {c.type === 'ONLINE' ? '🌐' : '🏥'} {c.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
            {recentConsultations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  No consultations yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
