'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const FACILITIES = ['ICU', 'Emergency', 'Pharmacy', 'Lab', 'Radiology', 'Blood Bank',
  'Cafeteria', 'Parking', 'Online Consultation', 'Trauma Center', 'Physiotherapy', 'Dialysis']

export default function AddHospitalPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', locationLink: '', address: '', state: '', district: '',
    city: '', timings: '', phone: '', type: 'NORMAL', email: '',
    website: '', password: '', confirmPassword: '', description: '',
    isEmergency: false, isOnline: false, facilities: [],
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name) e.name = 'Required'
    if (!form.address) e.address = 'Required'
    if (!form.phone || !/^\d{10}$/.test(form.phone)) e.phone = 'Valid 10-digit phone required'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.timings) e.timings = 'Required'
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

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
    if (!validate()) return
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = form
      const res = await fetch('/api/super-admin/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Hospital added successfully!')
        router.push('/super-admin/hospitals')
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Server error')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, name, type = 'text', required }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type={type} value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
        <h2 className="text-2xl font-bold text-gray-800">Add Hospital</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Hospital Name" name="name" required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="NORMAL">Normal</option>
                <option value="MULTI_SPECIALITY">Multi Speciality</option>
                <option value="CLINIC">Clinic</option>
              </select>
            </div>
            <Field label="Phone Number" name="phone" type="tel" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Website" name="website" />
            <Field label="Timings" name="timings" required />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
              <textarea rows={2} value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
            <Field label="State" name="state" />
            <Field label="District" name="district" />
            <Field label="City" name="city" />
            <Field label="Google Maps Link" name="locationLink" />
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Services</h3>
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

          <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
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

        {/* Description */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Description</h3>
          <textarea rows={3} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief description about the hospital..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Password */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Login Password</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Password" name="password" type="password" required />
            <Field label="Confirm Password" name="confirmPassword" type="password" required />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2.5 rounded-lg transition disabled:opacity-50 text-sm">
            {loading ? 'Adding...' : 'Add Hospital'}
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
