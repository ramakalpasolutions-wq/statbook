'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Stethoscope, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DoctorDetailPage() {
  const { doctorId } = useParams()
  const router = useRouter()
  const [doctor, setDoctor] = useState(null)
  const [stats, setStats] = useState({})
  const [consultations, setConsultations] = useState([])

  useEffect(() => {
    fetch(`/api/super-admin/doctors/${doctorId}`)
      .then((r) => r.json())
      .then((data) => {
        setDoctor(data.doctor)
        setStats(data.stats)
        setConsultations(data.consultations)
      })
      .catch((err) => console.error(err))
  }, [doctorId])

  const toggleStatus = async () => {
    const newStatus = doctor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await fetch('/api/super-admin/doctors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: doctor.id, status: newStatus }),
    })
    toast.success(`Doctor marked ${newStatus}`)
    setDoctor({ ...doctor, status: newStatus })
  }

  if (!doctor) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  )

  const statusColors = {
    COMPLETED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    ACCEPTED: 'bg-teal-100 text-teal-700',
    CANCELLED: 'bg-red-100 text-red-700',
    RESCHEDULED: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{doctor.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{doctor.doctorId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold
            ${doctor.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {doctor.status}
          </span>
          <button onClick={toggleStatus}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition
              ${doctor.status === 'ACTIVE'
                ? 'bg-red-100 hover:bg-red-200 text-red-700'
                : 'bg-green-100 hover:bg-green-200 text-green-700'}`}>
            {doctor.status === 'ACTIVE'
              ? <><ToggleRight size={16} /> Deactivate</>
              : <><ToggleLeft size={16} /> Activate</>}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Consultations', value: stats.total },
          { label: 'Completed', value: stats.completed },
          { label: 'Cancelled', value: stats.cancelled },
          { label: 'Rescheduled', value: stats.rescheduled },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-800">{value ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Doctor Info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
            <Stethoscope size={26} className="text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{doctor.name}</h3>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {doctor.specializations?.map((s) => (
                <span key={s} className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[
            ['Hospital', doctor.hospital?.name],
            ['Experience', `${doctor.experience} years`],
            ['Qualification', doctor.qualification || '—'],
            ['Blood Group', doctor.bloodGroup || '—'],
            ['Phone', doctor.phone],
            ['Email', doctor.email],
            ['Consultation Fee', `₹${doctor.consultationFee}`],
            ['Online', doctor.isOnlineConsultation ? `✅ ₹${doctor.onlineConsultationFee}` : '❌'],
            ['Availability', doctor.availabilityType === 'FULL_DAY'
              ? `${doctor.startTime} – ${doctor.endTime}`
              : 'Time Slots'],
          ].map(([label, value]) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-medium text-gray-700 text-sm mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Consultations */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-800">Recent Consultations</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Patient', 'Hospital', 'Date', 'Time', 'Type', 'Status'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {consultations.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{c.user?.name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{c.hospital?.name}</td>
                <td className="px-4 py-3 text-gray-600">{new Date(c.date).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3 text-gray-600">{c.time}</td>
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
            {consultations.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No consultations yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
