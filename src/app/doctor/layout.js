'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Video, CalendarDays, User, LogOut, Menu, X, ChevronRight, Stethoscope } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: 'doctor/dashboard', icon: LayoutDashboard },
  { label: 'Consultations', href: 'doctor/consultations', icon: Stethoscope },
  { label: 'Online Consultations', href: 'doctor/online-consultations', icon: Video },
  { label: 'Calendar', href: 'doctor/calendar', icon: CalendarDays },
  { label: 'Profile', href: 'doctor/profile', icon: User },
]

export default function DoctorLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const profileRef = useRef(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [doctor, setDoctor] = useState(null)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    fetch('/api/doctor/me').then(r => r.json()).then(d => setDoctor(d.doctor)).catch(() => {})
  }, [])

  useEffect(() => {
    const handleClick = e => { if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="text-xs font-bold text-teal-400 tracking-widest uppercase">Stat Book</span>
            </div>
            <h1 className="text-sm font-bold text-white truncate">{doctor?.name || 'Doctor'}</h1>
            <p className="text-xs text-gray-400 truncate">{doctor?.doctorId}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400"><X size={20} /></button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === `/${href}` || pathname.startsWith(`/${href}`)
            return (
              <Link key={href} href={`/${href}`} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                <Icon size={18} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {!active && <ChevronRight size={14} className="flex-shrink-0" />}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-700">
          {doctor && <div className="px-4 py-2 mb-2"><p className="text-xs text-gray-400 truncate">{doctor.email}</p></div>}
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white w-full transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600"><Menu size={22} /></button>
            <div className="hidden sm:block">
              <p className="font-bold text-gray-800 text-sm leading-tight">Dr. {doctor?.name}</p>
              <p className="text-xs text-gray-400">{doctor?.specializations?.join(', ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full font-medium hidden sm:block bg-green-100 text-green-700">{doctor?.hospital?.name}</span>
            <div className="relative" ref={profileRef}>
              <button onClick={() => setShowProfile(!showProfile)} className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center hover:bg-teal-200">
                <User size={18} className="text-teal-700" />
              </button>
              {showProfile && (
                <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center"><Stethoscope size={22} className="text-teal-700" /></div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">Dr. {doctor?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{doctor?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm mb-3">
                    {[['Doctor ID', doctor?.doctorId], ['Hospital', doctor?.hospital?.name], ['Specialization', doctor?.specializations?.join(', ')], ['Experience', `${doctor?.experience} yrs`]].map(([label, value]) => (
                      <div key={label} className="flex justify-between"><span className="text-gray-500">{label}</span><span className="font-medium text-xs text-gray-700">{value}</span></div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { router.push('/doctor/profile'); setShowProfile(false) }} className="flex-1 bg-teal-50 hover:bg-teal-100 text-teal-600 py-2 rounded-lg text-sm font-medium">Edit Profile</button>
                    <button onClick={handleLogout} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium">Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
