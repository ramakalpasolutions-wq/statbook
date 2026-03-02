'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Hospital, DollarSign, Users, LogOut, User, Circle } from 'lucide-react'

const navItems = [
  { href: '/super-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/super-admin/hospitals', label: 'Hospitals', icon: Hospital },
  { href: '/super-admin/revenue', label: 'Revenue', icon: DollarSign },
  { href: '/super-admin/users', label: 'Users', icon: Users },
  { href: '/super-admin/profile', label: 'Profile', icon: User },
]

export default function SuperAdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-blue-900 text-white flex flex-col h-full">
      <div className="p-6 border-b border-blue-800">
        <h2 className="text-xl font-bold">STAT BOOK</h2>
        <p className="text-blue-300 text-xs mt-1">Super Admin</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm font-medium
              ${pathname === href ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Online indicator + logout */}
      <div className="p-4 border-t border-blue-800 space-y-2">
        <div className="flex items-center gap-2 text-green-400 text-sm px-4">
          <Circle size={8} fill="currentColor" />
          Online
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-300 hover:bg-red-900 hover:text-white w-full text-sm transition">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
