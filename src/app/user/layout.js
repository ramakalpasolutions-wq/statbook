'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Home, AlertTriangle, User, LogOut,
  Menu, X, Heart, ChevronRight, FlaskConical, HeartHandshake
} from 'lucide-react'

const navItems = [
  { label: 'Home', href: '/user/dashboard', icon: Home },
  { label: 'Emergency', href: '/user/emergency', icon: AlertTriangle },
  { label: 'Lab Tests', href: '/user/coming-soon', icon: FlaskConical },
  { label: 'Healthcare Escort', href: '/user/coming-soon-escort', icon: HeartHandshake },
  { label: 'Profile', href: '/user/profile', icon: User },
]

export default function UserLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const profileRef = useRef(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    fetch('/api/user/me').then(r => r.json()).then(d => setUser(d.user)).catch(() => {})
  }, [])

  useEffect(() => {
    const handleClick = e => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
    }
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
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <Heart size={16} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-base leading-none">STAT</span>
              <span className="text-teal-400 font-bold text-base leading-none"> BOOK</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={label} href={href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={14} />}
              </Link>
            )
          })}
        </nav>

        {/* User info + logout */}
        <div className="px-3 py-4 border-t border-gray-700">
          {user && (
            <div className="px-4 py-2 mb-2">
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              <p className="text-xs font-medium text-gray-300 truncate">{user.phone}</p>
            </div>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white w-full transition-colors">
            <LogOut size={18} />
            Logout
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
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                <Heart size={15} className="text-teal-600" />
              </div>
              <span className="font-bold text-gray-800 hidden sm:block">STAT BOOK</span>
            </div>
          </div>

          {/* Welcome + profile */}
          <div className="flex items-center gap-3">
            {user && (
              <p className="hidden md:block text-sm text-gray-500">
                Welcome, <span className="font-semibold text-gray-800">{user.name}</span> 👋
              </p>
            )}

            <div className="relative" ref={profileRef}>
              <button onClick={() => setShowProfile(!showProfile)}
                className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center hover:bg-teal-200 transition-colors">
                <User size={18} className="text-teal-700" />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                    <div className="w-11 h-11 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-teal-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <Link href="/user/profile" onClick={() => setShowProfile(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 w-full">
                      <User size={14} /> My Profile
                    </Link>
                    <Link href="/user/emergency" onClick={() => setShowProfile(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 w-full">
                      <AlertTriangle size={14} /> Emergency
                    </Link>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link href="/user/profile" onClick={() => setShowProfile(false)}
                      className="flex-1 bg-teal-50 hover:bg-teal-100 text-teal-600 py-2 rounded-lg text-xs font-medium text-center transition-colors">
                      Edit Profile
                    </Link>
                    <button onClick={handleLogout}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-xs font-medium transition-colors">
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                  <Heart size={13} className="text-white" />
                </div>
                <span className="text-white font-bold">STAT BOOK</span>
              </div>
              <p className="text-xs leading-relaxed">Your trusted healthcare booking platform.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
              <ul className="space-y-1.5 text-xs">
                {[
                  ['Home', '/user/dashboard'],
                  ['Emergency', '/user/emergency'],
                  ['Profile', '/user/profile'],
                  ['Lab Tests', '/user/coming-soon'],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-teal-400 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Contact Us</h4>
              <p className="text-xs mb-1">+91 98765 43210</p>
              <p className="text-xs">support@statbook.in</p>
              <div className="flex gap-2 mt-3">
                {['FB', 'TW', 'IG', 'LI'].map(s => (
                  <div key={s} className="w-7 h-7 bg-gray-700 hover:bg-teal-600 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-colors text-white">
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 py-3 text-center text-xs">
            © 2026 STAT BOOK. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  )
}
