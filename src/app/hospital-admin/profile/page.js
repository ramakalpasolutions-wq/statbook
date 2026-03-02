'use client'
import { useEffect, useState } from 'react'
import { Building2, Save, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

export default function HospitalProfilePage() {
  const [hospital, setHospital] = useState(null)
  const [bankForm, setBankForm] = useState(null)
  const [profileForm, setProfileForm] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('info')

  useEffect(() => {
    fetch('/api/hospital-admin/profile')
      .then((r) => r.json())
      .then((data) => {
        setHospital(data.hospital)
        setProfileForm({
          name: data.hospital.name || '',
          phone: data.hospital.phone || '',
          email: data.hospital.email || '',
          website: data.hospital.website || '',
          address: data.hospital.address || '',
          state: data.hospital.state || '',
          district: data.hospital.district || '',
          city: data.hospital.city || '',
          timings: data.hospital.timings || '',
          locationLink: data.hospital.locationLink || '',
          description: data.hospital.description || '',
        })
        setBankForm({
          accountHolderName: data.hospital.bankDetails?.accountHolderName || '',
          bankName: data.hospital.bankDetails?.bankName || '',
          accountNumber: data.hospital.bankDetails?.accountNumber || '',
          ifscCode: data.hospital.bankDetails?.ifscCode || '',
          branchName: data.hospital.bankDetails?.branchName || '',
          upiId: data.hospital.bankDetails?.upiId || '',
        })
      })
  }, [])

  const saveProfile = async () => {
    setLoading(true)
    const res = await fetch('/api/hospital-admin/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'profile', ...profileForm }),
    })
    if (res.ok) toast.success('Profile updated!')
    else toast.error('Update failed')
    setLoading(false)
  }

  const saveBank = async () => {
    setLoading(true)
    const res = await fetch('/api/hospital-admin/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'bank', ...bankForm }),
    })
    if (res.ok) toast.success('Bank details saved!')
    else toast.error('Update failed')
    setLoading(false)
  }

  if (!hospital || !profileForm) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  )

  const Field = ({ label, name, type = 'text', form, setForm }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Building2 size={24} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{hospital.name}</h2>
          <p className="text-sm text-gray-500">{hospital.hospitalId} · {hospital.type?.replace('_', ' ')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[{ key: 'info', label: 'Hospital Info', icon: Building2 }, { key: 'bank', label: 'Bank Details', icon: CreditCard }]
          .map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition
                ${tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon size={15} /> {label}
            </button>
          ))}
      </div>

      {tab === 'info' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Hospital Name" name="name" form={profileForm} setForm={setProfileForm} />
              <Field label="Phone" name="phone" form={profileForm} setForm={setProfileForm} />
              <Field label="Email" name="email" type="email" form={profileForm} setForm={setProfileForm} />
              <Field label="Website" name="website" form={profileForm} setForm={setProfileForm} />
              <Field label="Timings" name="timings" form={profileForm} setForm={setProfileForm} />
              <Field label="Google Maps Link" name="locationLink" form={profileForm} setForm={setProfileForm} />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea rows={2} value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <Field label="State" name="state" form={profileForm} setForm={setProfileForm} />
              <Field label="District" name="district" form={profileForm} setForm={setProfileForm} />
              <Field label="City" name="city" form={profileForm} setForm={setProfileForm} />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Description</h3>
            <textarea rows={3} value={profileForm.description}
              onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={saveProfile} disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2.5 rounded-xl transition disabled:opacity-50 text-sm">
            <Save size={15} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {tab === 'bank' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Account Holder Name" name="accountHolderName" form={bankForm} setForm={setBankForm} />
              <Field label="Bank Name" name="bankName" form={bankForm} setForm={setBankForm} />
              <Field label="Account Number" name="accountNumber" form={bankForm} setForm={setBankForm} />
              <Field label="IFSC Code" name="ifscCode" form={bankForm} setForm={setBankForm} />
              <Field label="Branch Name" name="branchName" form={bankForm} setForm={setBankForm} />
              <Field label="UPI ID" name="upiId" form={bankForm} setForm={setBankForm} />
            </div>
          </div>
          <button onClick={saveBank} disabled={loading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2.5 rounded-xl transition disabled:opacity-50 text-sm">
            <Save size={15} /> {loading ? 'Saving...' : 'Save Bank Details'}
          </button>
        </div>
      )}
    </div>
  )
}
