'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, ClipboardList, Siren, Stethoscope,
  History, Calendar, Video, User, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react'

const navItems = [
  { href: '/hospital-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hospital-admin/consultation', label: 'Consultation', icon: ClipboardList },
  { href: '/hospital-admin/emergency', label: 'Emergency', icon: Siren },
  { href: '/hospital-admin/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/hospital-admin/history', label: 'History', icon: History },
  { href: '/hospital-admin/calendar', label: 'Calendar', icon: Calendar },
  { href: '/hospital-admin/online-consultation', label: 'Online Consultation', icon: Video },
  { href: '/hospital-admin/profile', label: 'Profile', icon: User },
]

export default function HospitalAdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-teal-900 text-white flex flex-col h-full transition-all duration-300`}>
      <div className="p-4 border-b border-teal-800 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h2 className="text-lg font-bold">STAT BOOK</h2>
            <p className="text-teal-300 text-xs">Hospital Admin</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-teal-300 hover:text-white ml-auto">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm font-medium
              ${pathname === href ? 'bg-teal-700 text-white' : 'text-teal-200 hover:bg-teal-800 hover:text-white'}`}>
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-teal-800">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-300 hover:bg-red-900 hover:text-white w-full text-sm transition">
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  )
}
