'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CalendarDays, Clock, User, Stethoscope, Building2, Video } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  PENDING:     'bg-yellow-100 text-yellow-700',
  ACCEPTED:    'bg-teal-100 text-teal-700',
  COMPLETED:   'bg-green-100 text-green-700',
  CANCELLED:   'bg-red-100 text-red-700',
  RESCHEDULED: 'bg-blue-100 text-blue-700',
}

export default function ConsultationDetailPage() {
  const { consultationId } = useParams()
  const router = useRouter()
  const [consultation, setConsultation] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => {
    fetch(`/api/hospital-admin/consultations/${consultationId}`)
      .then((r) => r.json())
      .then((d) => setConsultation(d.consultation))
  }

  useEffect(() => { load() }, [consultationId])

  const updateStatus = async (status) => {
    setLoading(true)
    try {
      const res = await fetch('/api/hospital-admin/consultations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: consultation.id, status }),
      })
      if (res.ok) {
        toast.success(`Marked as ${status.toLowerCase()}`)
        load()
      } else {
        toast.error('Failed to update')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!consultation) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  )

  const c = consultation

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Consultation Details</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{c.consultationId}</p>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${STATUS_COLORS[c.status]}`}>
          {c.status}
        </span>
      </div>

      {/* Date / Time / Type */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: CalendarDays, label: 'Date',  value: new Date(c.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), color: 'blue' },
          { icon: Clock,        label: 'Time',  value: c.time, color: 'teal' },
          { icon: c.type === 'ONLINE' ? Video : Building2, label: 'Type', value: c.type, color: c.type === 'ONLINE' ? 'purple' : 'gray' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className={`w-10 h-10 bg-${color}-100 rounded-full flex items-center justify-center mx-auto mb-2`}>
              <Icon size={18} className={`text-${color}-600`} />
            </div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="font-semibold text-gray-800 text-sm mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Patient + Doctor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Patient */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={18} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Patient</h3>
          </div>
          <div className="space-y-2 text-sm">
            {[
              ['Name',    c.user?.name],
              ['Phone',   c.user?.phone],
              ['Email',   c.user?.email],
              ...(c.patientName ? [['For',  c.patientName], ['Relation', c.patientRelation]] : []),
            ].map(([label, value]) => value ? (
              <div key={label} className="flex justify-between">
                <span className="text-gray-400">{label}</span>
                <span className="font-medium text-gray-700">{value}</span>
              </div>
            ) : null)}
          </div>
        </div>

        {/* Doctor */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <Stethoscope size={18} className="text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Doctor</h3>
          </div>
          <div className="space-y-2 text-sm">
            {[
              ['Name',           c.doctor?.name],
              ['Specialization', c.doctor?.specializations?.[0]],
              ['Doctor ID',      c.doctor?.doctorId],
              ['Fee',            `₹${c.fee}`],
            ].map(([label, value]) => value ? (
              <div key={label} className="flex justify-between">
                <span className="text-gray-400">{label}</span>
                <span className="font-medium text-gray-700">{value}</span>
              </div>
            ) : null)}
          </div>
        </div>
      </div>

      {/* Meet Link */}
      {c.type === 'ONLINE' && c.meetLink && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video size={18} className="text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-800">Video Consultation Link</p>
              <p className="text-xs text-purple-500 truncate max-w-xs">{c.meetLink}</p>
            </div>
          </div>
          <a href={c.meetLink} target="_blank" rel="noreferrer"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition">
            Join
          </a>
        </div>
      )}

      {/* Description */}
      {c.description && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 mb-1">Description / Notes</p>
          <p className="text-sm text-gray-700">{c.description}</p>
        </div>
      )}

      {/* Cancellation Info */}
      {c.status === 'CANCELLED' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
          <p className="font-medium text-red-700 mb-1">Cancellation Details</p>
          <p className="text-red-600">Cancelled by: <span className="font-medium">{c.cancelledByName || c.cancelledBy}</span></p>
        </div>
      )}

      {/* Actions */}
      {(c.status === 'PENDING' || c.status === 'ACCEPTED') && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-700 mb-3">Update Status</p>
          <div className="flex gap-3 flex-wrap">
            {c.status === 'PENDING' && (
              <>
                <button disabled={loading} onClick={() => updateStatus('ACCEPTED')}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                  ✅ Accept
                </button>
                <button disabled={loading} onClick={() => updateStatus('CANCELLED')}
                  className="px-5 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition disabled:opacity-50">
                  ❌ Cancel
                </button>
              </>
            )}
            {c.status === 'ACCEPTED' && (
              <>
                <button disabled={loading} onClick={() => updateStatus('COMPLETED')}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                  ✅ Mark Complete
                </button>
                <button disabled={loading} onClick={() => updateStatus('CANCELLED')}
                  className="px-5 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition disabled:opacity-50">
                  ❌ Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
