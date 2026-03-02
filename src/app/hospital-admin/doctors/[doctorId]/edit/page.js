'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Stethoscope } from 'lucide-react'

const SPECIALIZATIONS = [
  'Cardiologist', 'Neurologist', 'Orthopedic', 'Gynecologist',
  'Pediatrician', 'Dermatologist', 'Psychiatrist', 'General Physician',
  'ENT Specialist', 'Ophthalmologist', 'Urologist', 'Oncologist',
  'Radiologist', 'Anesthesiologist', 'Internal Medicine', 'Sports Medicine',
  'Cosmetologist', 'Obstetrician', 'Psychotherapist',
]

export default function EditDoctorPage() {
  const { doctorId } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(null)

  useEffect(() => {
    fetch(`/api/hospital-admin/doctors/${doctorId}`)
      .then((r) => r.json())
      .then((d) => {
        const doc = d.doctor
        setForm({
          name:                 doc.name,
          email:                doc.email,
          phone:                doc.phone,
          address:              doc.address || '',
          bloodGroup:           doc.bloodGroup || '',
          qualification:        doc.qualification || '',
          experience:           doc.experience,
          specializations:      doc.specializations || [],
          consultationFee:      doc.consultationFee,
          availabilityType:     doc.availabilityType,
          startTime:            doc.startTime || '',
          endTime:              doc.endTime || '',
          isOnlineConsultation: doc.isOnlineConsultation,
          onlineConsultationFee: doc.onlineConsultationFee || '',
          status:               doc.status,
          password:             '',  // leave blank = no change
        })
      })
  }, [doctorId])

  const toggleSpec = (s) => {
    setForm((f) => ({
      ...f,
      specializations: f.specializations.includes(s)
        ? f.specializations.filter((x) => x !== s)
        : [...f.specializations, s],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const body = { ...form }
      if (!body.password) delete body.password  // don't update if blank

      const res = await fetch(`/api/hospital-admin/doctors/${doctorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed'); return }
      toast.success('Doctor updated!')
      router.push(`/hospital-admin/doctors/${doctorId}`)
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!form) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Stethoscope size={22} className="text-teal-600" /> Edit Doctor
          </h2>
          <p className="text-sm text-gray-400">Update doctor profile information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Full Name',     key: 'name',          type: 'text' },
              { label: 'Email',         key: 'email',         type: 'email' },
              { label: 'Phone',         key: 'phone',         type: 'text' },
              { label: 'Blood Group',   key: 'bloodGroup',    type: 'text' },
              { label: 'Qualification', key: 'qualification', type: 'text' },
              { label: 'Experience (yrs)', key: 'experience', type: 'number' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input type={type} value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: type === 'number' ? +e.target.value : e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
            <input type="text" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Specializations */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-3">Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map((s) => (
              <button type="button" key={s} onClick={() => toggleSpec(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition
                  ${form.specializations.includes(s)
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Consultation */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Consultation Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Consultation Fee (₹)</label>
              <input type="number" value={form.consultationFee}
                onChange={(e) => setForm({ ...form, consultationFee: +e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Availability Type</label>
              <select value={form.availabilityType}
                onChange={(e) => setForm({ ...form, availabilityType: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="FULL_DAY">Full Day</option>
                <option value="TIME_INTERVALS">Time Intervals</option>
              </select>
            </div>
            {form.availabilityType === 'FULL_DAY' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                  <input type="time" value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                  <input type="time" value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </>
            )}
          </div>

          {/* Online Consultation */}
          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" id="online" checked={form.isOnlineConsultation}
              onChange={(e) => setForm({ ...form, isOnlineConsultation: e.target.checked })}
              className="w-4 h-4 accent-blue-600" />
            <label htmlFor="online" className="text-sm text-gray-700">Online Consultation Available</label>
          </div>
          {form.isOnlineConsultation && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Online Fee (₹)</label>
              <input type="number" value={form.onlineConsultationFee}
                onChange={(e) => setForm({ ...form, onlineConsultationFee: +e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
        </div>

        {/* Status + Password */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Account Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">New Password <span className="text-gray-400">(leave blank to keep current)</span></label>
              <input type="password" value={form.password} placeholder="••••••••"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.back()}
            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
