'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, CalendarDays, Stethoscope, DollarSign,
  HeartPulse, User, LogOut, Menu, X, ChevronRight,
  Building2, Bell
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',     href: '/hospital-admin/dashboard',     icon: LayoutDashboard },
  { label: 'Consultations', href: '/hospital-admin/consultations', icon: CalendarDays },
  { label: 'Doctors',       href: '/hospital-admin/doctors',       icon: Stethoscope },
  { label: 'Emergency',     href: '/hospital-admin/emergency',     icon: HeartPulse },
  { label: 'Revenue',       href: '/hospital-admin/revenue',       icon: DollarSign },
  { label: 'Profile',       href: '/hospital-admin/profile',       icon: Building2 },
]

export default function HospitalAdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const profileRef = useRef(null)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hospital, setHospital] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [pendingEmergencies, setPendingEmergencies] = useState(0)
  const [pendingConsultations, setPendingConsultations] = useState(0)

  useEffect(() => {
    fetch('/api/hospital-admin/me')
      .then((r) => r.json())
      .then((d) => setHospital(d.hospital))
      .catch(() => {})
  }, [])

  // Poll emergency + pending consultation counts every 30s
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [eRes, cRes] = await Promise.all([
          fetch('/api/hospital-admin/emergency?status=PENDING'),
          fetch('/api/hospital-admin/consultations?status=PENDING'),
        ])
        const [eData, cData] = await Promise.all([eRes.json(), cRes.json()])
        setPendingEmergencies(eData.emergencies?.length || 0)
        setPendingConsultations(cData.consultations?.length || 0)
      } catch {}
    }
    fetchCounts()
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  // Badge counts for nav items
  const navBadge = {
    '/hospital-admin/emergency': pendingEmergencies,
    '/hospital-admin/consultations': pendingConsultations,
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Stat Book</span>
            </div>
            <h1 className="text-sm font-bold text-white truncate">{hospital?.name || 'Hospital Admin'}</h1>
            <p className="text-xs text-gray-400 truncate">{hospital?.hospitalId || '...'}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white flex-shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            const badge = navBadge[href]
            return (
              <Link key={href} href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition group
                  ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                <Icon size={18} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0
                    ${active ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
                    {badge}
                  </span>
                )}
                {active && !badge && <ChevronRight size={14} className="flex-shrink-0" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-700">
          {hospital && (
            <div className="px-4 py-2 mb-2">
              <p className="text-xs text-gray-400 truncate">{hospital.email}</p>
              <span className={`text-xs font-medium
                ${hospital.status === 'ACTIVE' ? 'text-green-400' : 'text-yellow-400'}`}>
                ● {hospital.status}
              </span>
            </div>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-600 hover:text-white transition w-full">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900">
              <Menu size={22} />
            </button>
            <div className="hidden sm:block">
              <p className="font-bold text-gray-800 text-sm leading-tight">{hospital?.name || 'Hospital Admin'}</p>
              <p className="text-xs text-gray-400">{hospital?.hospitalId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Emergency Bell */}
            <button
              onClick={() => router.push('/hospital-admin/emergency')}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
              <Bell size={18} className="text-gray-600" />
              {pendingEmergencies > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {pendingEmergencies}
                </span>
              )}
            </button>

            {/* Status badge */}
            {hospital?.status && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium hidden sm:block
                ${hospital.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  hospital.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'}`}>
                {hospital.status}
              </span>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition">
                <User size={18} className="text-blue-700" />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building2 size={22} className="text-blue-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{hospital?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{hospital?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-3">
                    {[
                      ['Hospital ID', hospital?.hospitalId],
                      ['Type', hospital?.type?.replace('_', ' ')],
                      ['Phone', hospital?.phone],
                      ['City', hospital?.city],
                    ].map(([label, value]) => value && (
                      <div key={label} className="flex justify-between">
                        <span className="text-gray-500">{label}</span>
                        <span className="font-medium text-xs text-gray-700">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { router.push('/hospital-admin/profile'); setShowProfile(false) }}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg text-xs font-medium transition">
                      Edit Profile
                    </button>
                    <button onClick={handleLogout}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-xs font-medium transition">
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
