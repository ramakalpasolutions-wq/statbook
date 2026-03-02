'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { User } from 'lucide-react'

export default function SuperAdminProfile() {
  const [profile, setProfile] = useState({ name: '', phone: '', email: '', role: 'SUPER_ADMIN' })
  const [editing, setEditing] = useState(false)
  const [resetPass, setResetPass] = useState({ old: '', new: '', confirm: '' })
  const [showReset, setShowReset] = useState(false)

  useEffect(() => {
    fetch('/api/auth/profile')
      .then((r) => r.json())
      .then(setProfile)
  }, [])

  const saveProfile = async () => {
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: profile.name, phone: profile.phone }),
    })
    if (res.ok) { toast.success('Profile updated!'); setEditing(false) }
    else toast.error('Update failed')
  }

  const resetPassword = async () => {
    if (resetPass.new !== resetPass.confirm) { toast.error('Passwords do not match'); return }
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: resetPass.old, newPassword: resetPass.new }),
    })
    if (res.ok) { toast.success('Password reset!'); setShowReset(false); setResetPass({ old: '', new: '', confirm: '' }) }
    else toast.error('Old password incorrect')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
            {profile.profilePhoto
              ? <img src={profile.profilePhoto} className="w-20 h-20 rounded-full object-cover" alt="profile" />
              : <User size={36} className="text-blue-600" />
            }
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{profile.name}</h3>
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">{profile.role}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
            <input type="text" value={profile.name} disabled={!editing}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                ${editing ? 'border-blue-300 bg-white' : 'bg-gray-50 border-gray-200 cursor-not-allowed'}`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
            <input type="tel" value={profile.phone} disabled={!editing}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                ${editing ? 'border-blue-300 bg-white' : 'bg-gray-50 border-gray-200 cursor-not-allowed'}`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email <span className="text-gray-400">(not editable)</span></label>
            <input type="email" value={profile.email} disabled
              className="w-full border rounded-lg px-4 py-2.5 text-sm bg-gray-50 border-gray-200 cursor-not-allowed" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          {editing ? (
            <>
              <button onClick={saveProfile} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition">Save Changes</button>
              <button onClick={() => setEditing(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm transition">Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition">Edit Profile</button>
          )}
          <button onClick={() => setShowReset(!showReset)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm transition">
            Reset Password
          </button>
        </div>
      </div>

      {/* Reset Password */}
      {showReset && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Reset Password</h3>
          {[['old', 'Old Password'], ['new', 'New Password'], ['confirm', 'Confirm New Password']].map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type="password" value={resetPass[key]}
                onChange={(e) => setResetPass({ ...resetPass, [key]: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={resetPassword} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition">Update Password</button>
            <button onClick={() => setShowReset(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm transition">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
