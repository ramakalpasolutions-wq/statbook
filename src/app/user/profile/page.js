'use client'
import { useEffect, useState } from 'react'
import {
  User, Phone, Mail, MapPin, Edit2, Save, X,
  Plus, Trash2, Stethoscope, Building2, Calendar,
  Clock, CheckCircle, XCircle, AlertCircle, Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  PENDING:   { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  ACCEPTED:  { color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  COMPLETED: { color: 'bg-blue-100 text-blue-700',    icon: CheckCircle },
  CANCELLED: { color: 'bg-red-100 text-red-700',      icon: XCircle },
  RESCHEDULED: { color: 'bg-purple-100 text-purple-700', icon: AlertCircle },
}

export default function UserProfilePage() {
  const [user, setUser] = useState(null)
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', relation: '', dob: '', blood: '' })
  const [showAddMember, setShowAddMember] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/consultations'),
      ])
      const pData = await pRes.json()
      const cData = await cRes.json()
      setUser(pData.user)
      setConsultations(cData.consultations || [])
      setForm({
        name: pData.user?.name || '',
        phone: pData.user?.phone || '',
        address: pData.user?.address || '',
      })
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Profile updated!')
      setEditMode(false)
      loadProfile()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match')
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Password changed!')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
      setShowPw(false)
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleAddFamilyMember = async () => {
    if (!newMember.name || !newMember.relation) return toast.error('Name and relation required')
    const updated = [...(user.familyMembers || []), { ...newMember, id: `fm_${Date.now()}` }]
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyMembers: updated }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Family member added!')
      setNewMember({ name: '', relation: '', dob: '', blood: '' })
      setShowAddMember(false)
      loadProfile()
    } catch (err) { toast.error(err.message) }
  }

  const handleRemoveFamilyMember = async (id) => {
    const updated = (user.familyMembers || []).filter(f => f.id !== id)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyMembers: updated }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Member removed')
      loadProfile()
    } catch (err) { toast.error(err.message) }
  }

  const handleCancelConsultation = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    try {
      const res = await fetch('/api/user/consultations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Appointment cancelled')
      loadProfile()
    } catch (err) { toast.error(err.message) }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'profile', label: 'Profile' },
          { id: 'family', label: `Family Members (${user?.familyMembers?.length || 0})` },
          { id: 'consultations', label: `Appointments (${consultations.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
              ${activeTab === t.id ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center">
                  <User size={28} className="text-teal-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button onClick={() => setEditMode(!editMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
                  ${editMode ? 'bg-gray-100 text-gray-600' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}>
                {editMode ? <><X size={14} /> Cancel</> : <><Edit2 size={14} /> Edit</>}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', icon: User },
                { label: 'Phone', key: 'phone', icon: Phone },
                { label: 'Address', key: 'address', icon: MapPin },
              ].map(({ label, key, icon: Icon }) => (
                <div key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    <Icon size={11} className="inline mr-1" />{label}
                  </label>
                  {editMode ? (
                    <input type="text"
                      value={form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  ) : (
                    <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2.5 rounded-xl">{user?.[key] || '—'}</p>
                  )}
                </div>
              ))}
              {/* Email readonly */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5"><Mail size={11} className="inline mr-1" />Email</label>
                <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2.5 rounded-xl">{user?.email}</p>
              </div>
            </div>

            {editMode && (
              <button onClick={handleSaveProfile} disabled={saving}
                className="mt-4 flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Password & Security</h3>
              <button onClick={() => setShowPw(!showPw)}
                className="text-sm text-teal-600 hover:underline">
                {showPw ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            {showPw && (
              <div className="space-y-3">
                {[
                  { label: 'Current Password', key: 'currentPassword' },
                  { label: 'New Password', key: 'newPassword' },
                  { label: 'Confirm New Password', key: 'confirm' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                    <input type="password" value={pwForm[key]}
                      onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                ))}
                <button onClick={handleChangePassword} disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Family Members Tab */}
      {activeTab === 'family' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Manage family members for booking appointments</p>
            <button onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              <Plus size={14} /> Add Member
            </button>
          </div>

          {/* Add Member Form */}
          {showAddMember && (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5">
              <h3 className="font-semibold text-teal-800 mb-4">Add Family Member</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'e.g. John Doe' },
                  { label: 'Relation *', key: 'relation', type: 'text', placeholder: 'e.g. Father, Mother' },
                  { label: 'Date of Birth', key: 'dob', type: 'date', placeholder: '' },
                  { label: 'Blood Group', key: 'blood', type: 'text', placeholder: 'e.g. O+' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input type={type} placeholder={placeholder} value={newMember[key]}
                      onChange={e => setNewMember({ ...newMember, [key]: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleAddFamilyMember}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                  <Plus size={14} /> Add Member
                </button>
                <button onClick={() => setShowAddMember(false)}
                  className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          )}

          {/* Members List */}
          {user?.familyMembers?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <User size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No family members added yet</p>
              <button onClick={() => setShowAddMember(true)} className="mt-3 text-teal-600 text-sm hover:underline">
                + Add your first family member
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.familyMembers.map(f => (
                <div key={f.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                        <User size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{f.name}</p>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{f.relation}</span>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveFamilyMember(f.id)}
                      className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  {(f.dob || f.blood) && (
                    <div className="flex gap-3 mt-3 text-xs text-gray-500">
                      {f.dob && <span>📅 {new Date(f.dob).toLocaleDateString('en-IN')}</span>}
                      {f.blood && <span>🩸 {f.blood}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Consultations Tab */}
      {activeTab === 'consultations' && (
        <div className="space-y-4">
          {consultations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Stethoscope size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No appointments yet</p>
            </div>
          ) : (
            consultations.map(c => {
              const statusConf = STATUS_CONFIG[c.status] || STATUS_CONFIG.PENDING
              const StatusIcon = statusConf.icon
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Stethoscope size={18} className="text-teal-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">Dr. {c.doctor?.name}</p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {c.doctor?.specializations?.map(s => (
                            <span key={s} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Building2 size={11} /><span>{c.hospital?.name}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusConf.color}`}>
                      <StatusIcon size={12} />{c.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs text-gray-500">
                    <div><p className="text-gray-400">Date</p><p className="font-medium text-gray-700">{new Date(c.date).toLocaleDateString('en-IN')}</p></div>
                    <div><p className="text-gray-400">Time</p><p className="font-medium text-gray-700">{c.time}</p></div>
                    <div><p className="text-gray-400">Type</p><p className="font-medium text-gray-700">{c.type}</p></div>
                    <div><p className="text-gray-400">Fee</p><p className="font-bold text-teal-700">₹{c.fee}</p></div>
                  </div>

                  {c.patientName && c.patientName !== user?.name && (
                    <div className="mt-3 bg-blue-50 rounded-xl px-3 py-2 text-xs text-blue-700">
                      👤 Patient: <span className="font-semibold">{c.patientName}</span> ({c.patientRelation})
                    </div>
                  )}

                  {['PENDING', 'ACCEPTED'].includes(c.status) && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                      <button onClick={() => handleCancelConsultation(c.id)}
                        className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-xs font-medium transition-colors">
                        <XCircle size={13} /> Cancel Appointment
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
