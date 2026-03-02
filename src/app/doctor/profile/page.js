'use client'
import { useEffect, useState } from 'react'
import { User, Lock, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DoctorProfilePage() {
  const [doctor, setDoctor] = useState(null)
  const [form, setForm] = useState({})
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    fetch('/api/doctor/profile')
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch profile')
        return r.json()
      })
      .then(d => {
        if (!d.doctor) return
        setDoctor(d.doctor)
        setForm({
          phone: d.doctor.phone || '',
          email: d.doctor.email || '',
          address: d.doctor.address || '',
          experience: d.doctor.experience || '',
          consultationFee: d.doctor.consultationFee || '',
          onlineConsultationFee: d.doctor.onlineConsultationFee || '',
          isOnlineConsultation: d.doctor.isOnlineConsultation || false,
          bloodGroup: d.doctor.bloodGroup || '',
          qualification: d.doctor.qualification || '',
          availabilityType: d.doctor.availabilityType || 'FULLDAY',
          startTime: d.doctor.startTime || '',
          endTime: d.doctor.endTime || '',
        })
      })
      .catch(err => console.error('Profile fetch error:', err))
  }, [])

  const saveProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/doctor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) toast.success('Profile updated!')
      else {
        const d = await res.json()
        toast.error(d.error || 'Failed to update')
      }
    } catch {
      toast.error('Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match')
    if (passwords.new.length < 6) return toast.error('Min 6 characters')
    setPwLoading(true)
    try {
      const res = await fetch('/api/doctor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
      })
      if (res.ok) {
        toast.success('Password changed!')
        setPasswords({ current: '', new: '', confirm: '' })
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed')
      }
    } catch {
      toast.error('Failed to change password')
    } finally {
      setPwLoading(false)
    }
  }

  if (!doctor) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
    </div>
  )

  const editableFields = [
    { label: 'Name (not editable)', key: 'name', value: doctor.name, disabled: true },
    { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' },
    { label: 'Address', key: 'address' },
    { label: 'Experience (years)', key: 'experience', type: 'number' },
    { label: 'Consultation Fee (₹)', key: 'consultationFee', type: 'number' },
    { label: 'Blood Group', key: 'bloodGroup' },
    { label: 'Qualification', key: 'qualification' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your personal and professional details</p>
      </div>

      {/* Doctor Info Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={28} className="text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-800">Dr. {doctor.name}</h3>
          <p className="text-sm text-gray-500 truncate">{doctor.specializations?.join(', ')}</p>
          <p className="text-xs text-gray-400">{doctor.hospital?.name} · {doctor.doctorId}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${doctor.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {doctor.status}
        </span>
      </div>

      {/* Editable Fields */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User size={16} className="text-teal-600" /> Professional Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {editableFields.map(({ label, key, type = 'text', disabled = false, value }) => (
            <div key={key}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <input
                type={type}
                disabled={disabled}
                value={disabled ? (value ?? '') : (form[key] ?? '')}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
              />
            </div>
          ))}
        </div>

        {/* Availability Type */}
        <div className="mt-4">
          <label className="block text-xs text-gray-500 mb-1">Availability Type</label>
          <select
            value={form.availabilityType || 'FULLDAY'}
            onChange={e => setForm({ ...form, availabilityType: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="FULLDAY">Full Day</option>
            <option value="INTERVAL">Interval</option>
          </select>
        </div>

        {form.availabilityType === 'INTERVAL' && (
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Time</label>
              <input type="time" value={form.startTime || ''} onChange={e => setForm({ ...form, startTime: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Time</label>
              <input type="time" value={form.endTime || ''} onChange={e => setForm({ ...form, endTime: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
        )}

        {/* Online Consultation Toggle */}
        <div className="mt-4 flex items-center justify-between bg-blue-50 rounded-lg p-4">
          <div>
            <p className="font-medium text-gray-800 text-sm">Online Consultations</p>
            <p className="text-xs text-gray-500">Enable to accept online bookings</p>
          </div>
          <button
            onClick={() => setForm({ ...form, isOnlineConsultation: !form.isOnlineConsultation })}
            className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.isOnlineConsultation ? 'bg-teal-600' : 'bg-gray-300'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isOnlineConsultation ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {form.isOnlineConsultation && (
          <div className="mt-3">
            <label className="block text-xs text-gray-500 mb-1">Online Consultation Fee (₹)</label>
            <input
              type="number"
              value={form.onlineConsultationFee || ''}
              onChange={e => setForm({ ...form, onlineConsultationFee: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        )}

        <button
          onClick={saveProfile}
          disabled={loading}
          className="mt-5 flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60 transition-colors">
          <Save size={16} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Lock size={16} className="text-teal-600" /> Change Password
        </h3>
        <div className="space-y-3 max-w-sm">
          {[
            ['Current Password', 'current'],
            ['New Password', 'new'],
            ['Confirm New Password', 'confirm'],
          ].map(([label, key]) => (
            <div key={key}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <input
                type="password"
                value={passwords[key]}
                onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          ))}
          <button
            onClick={changePassword}
            disabled={pwLoading}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium text-sm disabled:opacity-60 transition-colors">
            <Lock size={15} />
            {pwLoading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  )
}
