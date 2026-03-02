'use client'
import { useRouter } from 'next/navigation'
import { User } from 'lucide-react'

export default function TopHeader({ title, profilePath }) {
  const router = useRouter()

  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-blue-700 font-bold text-lg">📊</span>
        <h1 className="text-gray-700 font-semibold">{title}</h1>
      </div>
      <button
        onClick={() => router.push(profilePath || '/super-admin/profile')}
        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
      >
        <User size={16} />
        Profile
      </button>
    </header>
  )
}
