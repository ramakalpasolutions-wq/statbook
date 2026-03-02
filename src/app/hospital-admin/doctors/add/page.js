'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const SPECIALIZATIONS = [
  'Cardiologist', 'Neurologist', 'Orthopedic', 'Gynecologist', 'Pediatrician',
  'Dermatologist', 'Psychiatrist', 'Ophthalmologist', 'ENT Specialist',
  'General Physician', 'Urologist', 'Oncologist', 'Endocrinologist',
  'Gastroenterologist', 'Pulmonologist', 'Nephrologist', 'Sports Medicine',
  'Obstetrician', 'Cosmetologist', 'Psychotherapist',
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const TIME_OPTIONS = []
for (let h = 0; h < 24; h++) {
  for (let m of [0, 30]) {
    const hh = String(h).padStart(2, '0')
    const mm = String(m).padStart(2, '0')
    TIME_OPTIONS.push(`${hh}:${mm}`)
  }
}

export default function AddDoctorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    bloodGroup: '', qualification: '', experience: '',
    specializations: [],
    consultationFee: '',
    availabilityType: 'FULL_DAY',
    startTime: '09:00', endTime: '17:00',
    timeSlots: [{ startTime: '09:00', endTime: '13:00' }],
    isOnlineConsultation: false,
    onlineConsultationFee: '',
    password: '', confirmPassword: '',
  })

  const toggleSpec = (s) => {
    setForm((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(s)
        ? prev.specializations.filter((x) => x !== s)
        : [...prev.specializations, s],
    }))
  }

  const addSlot = () => {
    setForm((prev) => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { startTime: '09:00', endTime: '13:00' }],
    }))
  }

  const removeSlot = (i) => {
    setForm((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, idx) => idx !== i),
    }))
  }

  const updateSlot = (i, field, value) => {
    setForm((prev) => {
      const slots = [...prev.timeSlots]
      slots[i] = { ...slots[i], [field]: value }
      return { ...prev, timeSlots: slots }
    })
  }

  const validate = () => {
    const e = {}
    if (!form.name) e.name = 'Required'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.phone || !/^\d{10}$/.test(form.phone)) e.phone = 'Valid 10-digit phone required'
    if (!form.experience || isNaN(form.experience)) e.experience = 'Valid number required'
    if (!form.consultationFee || isNaN(form.consultationFee)) e.consultationFee = 'Valid fee required'
    if (form.specializations.length === 0) e.specializations = 'Select at least one'
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (form.isOnlineConsultation && !form.onlineConsultationFee) e.onlineConsultationFee = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = form
      payload.experience = parseInt(payload.experience)
      payload.consultationFee = parseFloat(payload.consultationFee)
      if (payload.onlineConsultationFee) {
        payload.onlineConsultationFee = parseFloat(payload.onlineConsultationFee)
      }
      if (payload.availabilityType !== 'TIME_INTERVALS') {
        payload.timeSlots = null
      }
      const res = await fetch('/api/hospital-admin/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Doctor added successfully!')
        router.push('/hospital-admin/doctors')
      } else {
        toast.error(data.error || 'Failed to add doctor')
      }
    } catch {
      toast.error('Server error')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, name, type = 'text', required, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type={type} placeholder={placeholder}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
        <h2 className="text-2xl font-bold text-gray-800">Add Doctor</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" name="name" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Phone" name="phone" type="tel" required placeholder="10-digit number" />
            <Field label="Experience (Years)" name="experience" type="number" required />
            <Field label="Qualification" name="qualification" placeholder="e.g. MBBS, MD Cardiology" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select value={form.bloodGroup}
                onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select</option>
                {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea rows={2} value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-1">
            Specializations <span className="text-red-500">*</span>
          </h3>
          {errors.specializations && <p className="text-red-500 text-xs mb-2">{errors.specializations}</p>}
          <div className="flex flex-wrap gap-2 mt-3">
            {SPECIALIZATIONS.map((s) => (
              <button key={s} type="button" onClick={() => toggleSpec(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition
                  ${form.specializations.includes(s)
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Consultation */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Consultation & Fees</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Consultation Fee (₹)" name="consultationFee" type="number" required />
            <div>
              <label className="flex items-center gap-2 mb-3 cursor-pointer">
                <input type="checkbox" checked={form.isOnlineConsultation}
                  onChange={(e) => setForm({ ...form, isOnlineConsultation: e.target.checked })}
                  className="w-4 h-4 accent-blue-600" />
                <span className="text-sm font-medium text-gray-700">Enable Online Consultations</span>
              </label>
              {form.isOnlineConsultation && (
                <Field label="Online Fee (₹)" name="onlineConsultationFee" type="number" required />
              )}
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Availability</h3>

          {/* Type Toggle */}
          <div className="flex gap-3 mb-5">
            {[
              { value: 'FULL_DAY', label: '🕐 Full Day' },
              { value: 'TIME_INTERVALS', label: '⏱ Time Slots' },
            ].map(({ value, label }) => (
              <button key={value} type="button"
                onClick={() => setForm({ ...form, availabilityType: value })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition
                  ${form.availabilityType === value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Full Day */}
          {form.availabilityType === 'FULL_DAY' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <select value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <select value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Time Intervals */}
          {form.availabilityType === 'TIME_INTERVALS' && (
            <div className="space-y-3">
              {form.timeSlots.map((slot, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-xs font-medium text-gray-500 w-16 flex-shrink-0">Slot {i + 1}</span>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Start</label>
                      <select value={slot.startTime}
                        onChange={(e) => updateSlot(i, 'startTime', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">End</label>
                      <select value={slot.endTime}
                        onChange={(e) => updateSlot(i, 'endTime', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  {form.timeSlots.length > 1 && (
                    <button type="button" onClick={() => removeSlot(i)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex-shrink-0">
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addSlot}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                + Add Another Slot
              </button>
            </div>
          )}
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
            {loading ? 'Adding...' : 'Add Doctor'}
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
