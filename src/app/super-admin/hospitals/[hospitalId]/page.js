'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Building2, MapPin, Phone, Mail, Globe, Clock, Stethoscope, CreditCard, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function HospitalViewPage() {
  const { hospitalId } = useParams()
  const router = useRouter()
  const [hospital, setHospital] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [stats, setStats] = useState({})

  useEffect(() => {
    fetch(`/api/super-admin/hospitals/${hospitalId}`)
      .then((r) => r.json())
      .then((data) => {
        setHospital(data.hospital)
        setDoctors(data.doctors)
        setStats(data.stats)
      })
  }, [hospitalId])

  const toggleStatus = async () => {
    const newStatus = hospital.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await fetch('/api/super-admin/hospitals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: hospital.id, status: newStatus }),
    })
    toast.success(`Hospital marked ${newStatus}`)
    setHospital({ ...hospital, status: newStatus })
  }

  if (!hospital) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  )

  const statusColor = {
    ACTIVE: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    INACTIVE: 'bg-red-100 text-red-700',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{hospital.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{hospital.hospitalId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusColor[hospital.status]}`}>
            {hospital.status}
          </span>
          <button onClick={() => router.push(`/super-admin/hospitals/${hospitalId}/edit`)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition">
            Edit
          </button>
          <button onClick={toggleStatus}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2
              ${hospital.status === 'ACTIVE'
                ? 'bg-red-100 hover:bg-red-200 text-red-700'
                : 'bg-green-100 hover:bg-green-200 text-green-700'}`}>
            {hospital.status === 'ACTIVE'
              ? <><ToggleRight size={16} /> Deactivate</>
              : <><ToggleLeft size={16} /> Activate</>}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      {/* Stats Row */}
<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
  {[
    { label: 'Total Consultations', value: stats.totalConsultations, cls: 'border-blue-200' },
    { label: 'Today',               value: stats.todayConsultations,  cls: 'border-teal-200' },
    { label: 'Accepted',            value: stats.accepted,            cls: 'border-green-200' },
    { label: 'Cancelled',           value: stats.cancelled,           cls: 'border-red-200' },
    { label: 'Rescheduled',         value: stats.rescheduled,         cls: 'border-yellow-200' },
  ].map(({ label, value, cls }) => (
    <div key={label} className={`bg-white rounded-xl border p-4 text-center shadow-sm ${cls}`}>
      <p className="text-2xl font-bold text-gray-800">{value ?? 0}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  ))}
</div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hospital Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" /> Hospital Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {[
                { icon: MapPin, label: 'Address', value: hospital.address },
                { icon: MapPin, label: 'City / District / State', value: `${hospital.city || '—'} / ${hospital.district || '—'} / ${hospital.state || '—'}` },
                { icon: Phone, label: 'Phone', value: hospital.phone },
                { icon: Mail, label: 'Email', value: hospital.email },
                { icon: Globe, label: 'Website', value: hospital.website || '—' },
                { icon: Clock, label: 'Timings', value: hospital.timings },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="font-medium text-gray-700 break-all">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Type + Features */}
            <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {hospital.type.replace('_', ' ')}
              </span>
              {hospital.isEmergency && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">🚨 Emergency</span>
              )}
              {hospital.isOnline && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">🌐 Online</span>
              )}
            </div>

            {/* Description */}
            {hospital.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-600">{hospital.description}</p>
              </div>
            )}

            {/* Facilities */}
            {hospital.facilities?.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-400 mb-2">Facilities</p>
                <div className="flex flex-wrap gap-2">
                  {hospital.facilities.map((f) => (
                    <span key={f} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bank Details */}
          {hospital.bankDetails && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-green-600" /> Bank Details
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Account Holder', hospital.bankDetails.accountHolderName],
                  ['Bank Name', hospital.bankDetails.bankName],
                  ['Account Number', hospital.bankDetails.accountNumber],
                  ['IFSC Code', hospital.bankDetails.ifscCode],
                  ['Branch', hospital.bankDetails.branchName],
                  ['UPI ID', hospital.bankDetails.upiId || '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="font-medium text-gray-700">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Doctors Panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Stethoscope size={18} className="text-teal-600" />
            Doctors ({doctors.length})
          </h3>
          <div className="space-y-3">
            {doctors.map((d) => (
              <div key={d.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-800">{d.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${d.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {d.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{d.specializations?.join(', ')}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">{d.experience} yrs exp</p>
                  <p className="text-xs font-medium text-teal-700">₹{d.consultationFee}</p>
                </div>
                {d.isOnlineConsultation && (
                  <p className="text-xs text-blue-500 mt-1">🌐 Online: ₹{d.onlineConsultationFee}</p>
                )}
              </div>
            ))}
            {doctors.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No doctors assigned</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
