'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const FACILITIES = ['ICU', 'Emergency', 'Pharmacy', 'Lab', 'Radiology', 'Blood Bank',
  'Cafeteria', 'Parking', 'Online Consultation', 'Trauma Center', 'Physiotherapy', 'Dialysis']

export default function EditHospitalPage() {
  const { hospitalId } = useParams()
  const router = useRouter()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/super-admin/hospitals/${hospitalId}`)
      .then((r) => r.json())
      .then(({ hospital }) => {
        setForm({
          name: hospital.name || '',
          locationLink: hospital.locationLink || '',
          address: hospital.address || '',
          state: hospital.state || '',
          district: hospital.district || '',
          city: hospital.city || '',
          timings: hospital.timings || '',
          phone: hospital.phone || '',
          type: hospital.type || 'NORMAL',
          email: hospital.email || '',
          website: hospital.website || '',
          description: hospital.description || '',
          isEmergency: hospital.isEmergency || false,
          isOnline: hospital.isOnline || false,
          facilities: hospital.facilities || [],
        })
      })
  }, [hospitalId])

  const toggleFacility = (f) => {
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter((x) => x !== f)
        : [...prev.facilities, f],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/super-admin/hospitals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: hospitalId, ...form }),
      })
      if (res.ok) {
        toast.success('Hospital updated!')
        router.push(`/super-admin/hospitals/${hospitalId}`)
      } else {
        toast.error('Update failed')
      }
    } catch {
      toast.error('Server error')
    } finally {
      setLoading(false)
    }
  }

  if (!form) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  )

  const Field = ({ label, name, type = 'text' }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
        <h2 className="text-2xl font-bold text-gray-800">Edit Hospital</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Hospital Name" name="name" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="NORMAL">Normal</option>
                <option value="MULTI_SPECIALITY">Multi Speciality</option>
                <option value="CLINIC">Clinic</option>
              </select>
            </div>
            <Field label="Phone" name="phone" type="tel" />
            <Field label="Email" name="email" type="email" />
            <Field label="Website" name="website" />
            <Field label="Timings" name="timings" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea rows={2} value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <Field label="State" name="state" />
            <Field label="District" name="district" />
            <Field label="City" name="city" />
            <Field label="Google Maps Link" name="locationLink" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Services & Facilities</h3>
          <div className="flex gap-6 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isEmergency}
                onChange={(e) => setForm({ ...form, isEmergency: e.target.checked })}
                className="w-4 h-4 accent-blue-600" />
              <span className="text-sm font-medium text-gray-700">Emergency Services</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isOnline}
                onChange={(e) => setForm({ ...form, isOnline: e.target.checked })}
                className="w-4 h-4 accent-blue-600" />
              <span className="text-sm font-medium text-gray-700">Online Consultations</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {FACILITIES.map((f) => (
              <button key={f} type="button" onClick={() => toggleFacility(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition
                  ${form.facilities.includes(f)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Description</h3>
          <textarea rows={3} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2.5 rounded-lg transition disabled:opacity-50 text-sm">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-8 py-2.5 rounded-lg transition text-sm">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
