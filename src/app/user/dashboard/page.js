'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import Link from 'next/link'
import {
  Search, MapPin, Clock, Video, Building2,
  AlertTriangle, FlaskConical, HeartHandshake,
  Phone, ArrowRight, Navigation, Loader2, Stethoscope, Home
} from 'lucide-react'

const SPEC_META = {
  Cardiology:    { icon: '🫀', color: 'bg-red-50 border-red-100',     text: 'text-red-700',     hover: 'hover:border-red-300 hover:bg-red-100' },
  Neurology:     { icon: '🧠', color: 'bg-purple-50 border-purple-100', text: 'text-purple-700', hover: 'hover:border-purple-300 hover:bg-purple-100' },
  Orthopedics:   { icon: '🦴', color: 'bg-yellow-50 border-yellow-100', text: 'text-yellow-700', hover: 'hover:border-yellow-300 hover:bg-yellow-100' },
  Pediatrics:    { icon: '👶', color: 'bg-blue-50 border-blue-100',    text: 'text-blue-700',    hover: 'hover:border-blue-300 hover:bg-blue-100' },
  Dermatology:   { icon: '🧴', color: 'bg-pink-50 border-pink-100',    text: 'text-pink-700',    hover: 'hover:border-pink-300 hover:bg-pink-100' },
  Gynecology:    { icon: '🌸', color: 'bg-rose-50 border-rose-100',    text: 'text-rose-700',    hover: 'hover:border-rose-300 hover:bg-rose-100' },
  Ophthalmology: { icon: '👁️', color: 'bg-cyan-50 border-cyan-100',    text: 'text-cyan-700',    hover: 'hover:border-cyan-300 hover:bg-cyan-100' },
  ENT:           { icon: '👂', color: 'bg-orange-50 border-orange-100', text: 'text-orange-700', hover: 'hover:border-orange-300 hover:bg-orange-100' },
  Dentistry:     { icon: '🦷', color: 'bg-teal-50 border-teal-100',    text: 'text-teal-700',    hover: 'hover:border-teal-300 hover:bg-teal-100' },
  Psychiatry:    { icon: '🧘', color: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-700', hover: 'hover:border-indigo-300 hover:bg-indigo-100' },
  Oncology:      { icon: '🎗️', color: 'bg-violet-50 border-violet-100', text: 'text-violet-700', hover: 'hover:border-violet-300 hover:bg-violet-100' },
  General:       { icon: '🏥', color: 'bg-gray-50 border-gray-100',    text: 'text-gray-700',    hover: 'hover:border-gray-300 hover:bg-gray-100' },
  Urology:       { icon: '🫁', color: 'bg-blue-50 border-blue-100',    text: 'text-blue-700',    hover: 'hover:border-blue-300 hover:bg-blue-100' },
  Nephrology:    { icon: '🫘', color: 'bg-green-50 border-green-100',  text: 'text-green-700',   hover: 'hover:border-green-300 hover:bg-green-100' },
  Gastrology:    { icon: '🫃', color: 'bg-amber-50 border-amber-100',  text: 'text-amber-700',   hover: 'hover:border-amber-300 hover:bg-amber-100' },
  Pulmonology:   { icon: '🫁', color: 'bg-sky-50 border-sky-100',      text: 'text-sky-700',     hover: 'hover:border-sky-300 hover:bg-sky-100' },
}
const DEFAULT_META = { icon: '🏥', color: 'bg-teal-50 border-teal-100', text: 'text-teal-700', hover: 'hover:border-teal-300 hover:bg-teal-100' }

const SERVICES = [
  {
    label: 'In-Hospital',
    desc: 'Book in-person visits',
    icon: Building2,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    iconBg: 'bg-blue-100',
    href: '/user/hospitals',
  },
  {
    label: 'Specializations',
    desc: 'Browse by specialty',
    icon: Stethoscope,
    color: 'bg-teal-50 text-teal-600 border-teal-100',
    iconBg: 'bg-teal-100',
    href: '/user/specializations',
  },
  {
  label: 'Online Consult',
  desc: 'Consult from home',
  icon: Video,
  color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  iconBg: 'bg-indigo-100',
  href: '/user/hospitals?type=online',  // ← goes to hospitals filtered by online
},
  {
    label: 'Emergency',
    desc: '24/7 emergency alert',
    icon: AlertTriangle,
    color: 'bg-red-50 text-red-600 border-red-100',
    iconBg: 'bg-red-100',
    href: '/user/emergency',
  },
  {
    label: 'Lab Tests',
    desc: 'Book lab tests',
    icon: FlaskConical,
    color: 'bg-purple-50 text-purple-600 border-purple-100',
    iconBg: 'bg-purple-100',
    href: '/user/coming-soon',
  },
  {
    label: 'Healthcare Escort',
    desc: 'Personal health escort',
    icon: HeartHandshake,
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    iconBg: 'bg-orange-100',
    href: '/user/coming-soon-escort',
  },
  {
    label: 'Doctor to Home',
    desc: 'Doctor visits at home',
    icon: Home,
    color: 'bg-green-50 text-green-600 border-green-100',
    iconBg: 'bg-green-100',
    href: '/user/coming-soon',
  },
]

function DashboardContent() {
  const [search, setSearch] = useState('')
  const [hospitals, setHospitals] = useState([])
  const [specializations, setSpecializations] = useState([])
  const [loading, setLoading] = useState(true)
  const [locationLoading, setLocationLoading] = useState(true)
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null, city: null })

  useEffect(() => {
    loadSpecializations()

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, city: null }
          setUserLocation(loc)
          loadHospitals('', loc)
          setLocationLoading(false)
        },
        () => {
          fetch('/api/user/me')
            .then(r => r.json())
            .then(d => {
              const city = d.user?.location || null
              const loc = { lat: null, lng: null, city }
              setUserLocation(loc)
              loadHospitals('', loc)
            })
            .catch(() => loadHospitals('', {}))
            .finally(() => setLocationLoading(false))
        },
        { timeout: 5000 }
      )
    } else {
      loadHospitals('', {})
      setLocationLoading(false)
    }
  }, [])

  const loadSpecializations = async () => {
    try {
      const res = await fetch('/api/user/specializations')
      const data = await res.json()
      setSpecializations(data.specializations || [])
    } catch (err) { console.error(err) }
  }

  const loadHospitals = useCallback(async (searchVal = '', loc = {}) => {
    setLoading(true)
    try {
      const q = new URLSearchParams()
      if (searchVal) q.set('search', searchVal)
      if (loc.lat) q.set('lat', loc.lat)
      if (loc.lng) q.set('lng', loc.lng)
      if (loc.city) q.set('city', loc.city)
      const res = await fetch(`/api/user/hospitals?${q}`)
      const data = await res.json()
      setHospitals(data.hospitals || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  const handleSearch = e => {
    e.preventDefault()
    loadHospitals(search, userLocation)
  }

  return (
    <div className="space-y-10 pb-10">

      {/* ── Hero Search ───────────────────────────────────── */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-blue-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Find the Right Care</h1>
        <p className="text-teal-100 text-sm flex items-center gap-1.5 mb-4">
          {locationLoading
            ? <><Loader2 size={13} className="animate-spin" /> Detecting your location...</>
            : userLocation.lat
              ? <><Navigation size={13} /> Showing nearest hospitals</>
              : userLocation.city
                ? <><MapPin size={13} /> Showing hospitals in {userLocation.city}</>
                : <><MapPin size={13} /> Search hospitals near you</>
          }
        </p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text"
              placeholder="Search hospitals, specializations, city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
          </div>
          <button type="submit"
            className="bg-white text-teal-700 font-semibold px-5 py-3 rounded-xl hover:bg-teal-50 transition-colors text-sm whitespace-nowrap">
            Search
          </button>
        </form>
      </div>

      {/* ── Our Services ──────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Our Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {SERVICES.map(s => (
            <Link key={s.label} href={s.href}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all hover:shadow-md hover:-translate-y-0.5 ${s.color}`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.iconBg}`}>
                <s.icon size={22} />
              </div>
              <div className="text-center">
                <p className="font-bold text-xs leading-tight">{s.label}</p>
                <p className="text-xs opacity-60 mt-0.5 leading-tight hidden sm:block">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Specializations Grid ──────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Browse by Specialization</h2>
          <Link href="/user/specializations"
            className="text-xs text-teal-600 hover:underline flex items-center gap-1 font-medium">
            View all <ArrowRight size={11} />
          </Link>
        </div>

        {specializations.length === 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {Array(12).fill(null).map((_, i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {specializations.slice(0, 12).map(spec => {
              const meta = SPEC_META[spec] || DEFAULT_META
              return (
                <Link key={spec}
                  href={`/user/specializations/${encodeURIComponent(spec)}`}
                  className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all hover:shadow-md hover:-translate-y-0.5 group ${meta.color} ${meta.hover}`}>
                  <span className="text-3xl">{meta.icon}</span>
                  <p className={`font-bold text-xs text-center leading-tight ${meta.text}`}>{spec}</p>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* ── All Nearest Hospitals ─────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {userLocation.lat ? '📍 Hospitals Near You'
              : userLocation.city ? `🏙️ Hospitals in ${userLocation.city}`
              : '🏥 All Hospitals'}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{hospitals.length} found</span>
            <Link href="/user/hospitals"
              className="text-xs text-teal-600 hover:underline flex items-center gap-1 font-medium">
              View all <ArrowRight size={11} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(null).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse space-y-3">
                <div className="flex gap-3">
                  <div className="w-11 h-11 bg-gray-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-8 bg-gray-100 rounded-xl mt-2" />
              </div>
            ))}
          </div>
        ) : hospitals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Building2 size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium">No hospitals found</p>
            <button onClick={() => loadHospitals('', userLocation)}
              className="mt-3 text-teal-600 text-xs hover:underline">Clear search & reset</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hospitals.map(h => (
              <Link key={h.id} href={`/user/hospitals/${h.id}`}
                className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all group block">

                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 size={20} className="text-teal-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-800 truncate group-hover:text-teal-700 text-sm leading-tight">
                      {h.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        {h.type?.replace(/_/g, ' ')}
                      </span>
                      {h.distanceKm !== null && (
                        <span className="text-xs text-teal-600 font-bold flex items-center gap-1">
                          <Navigation size={10} />{h.distanceKm} km
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={11} className="flex-shrink-0 text-gray-400" />
                    <span className="truncate">
                      {h.city ? `${h.city}${h.state ? ', ' + h.state : ''}` : h.address}
                    </span>
                  </div>
                  {h.timings && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} className="flex-shrink-0 text-gray-400" />
                      <span>{h.timings}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Phone size={11} className="flex-shrink-0 text-gray-400" />
                    <span>{h.phone}</span>
                  </div>
                </div>

                {/* Specializations */}
                {h.specializations?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {h.specializations.slice(0, 3).map(s => (
                      <span key={s} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                    {h.specializations.length > 3 && (
                      <span className="text-xs text-gray-400">+{h.specializations.length - 3} more</span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-1.5 pt-2.5 border-t border-gray-50">
                  {h.isOnline && (
                    <span className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                      <Video size={9} /> Online
                    </span>
                  )}
                  {h.isEmergency && (
                    <span className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                      <AlertTriangle size={9} /> 24/7
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-1 text-xs text-teal-600 font-semibold group-hover:gap-2 transition-all">
                    Book Now <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Contact Us CTA ────────────────────────────────── */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-700 rounded-2xl p-8 text-white text-center">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Phone size={26} className="text-white" />
        </div>
        <h2 className="text-xl font-bold mb-2">Need Help?</h2>
        <p className="text-teal-100 text-sm mb-6 max-w-sm mx-auto">
          Our healthcare support team is available 24/7 to assist you with bookings, emergencies, or queries.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="tel:+919876543210"
            className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors text-sm">
            <Phone size={16} /> +91 98765 43210
          </a>
          <a href="mailto:support@statbook.in"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm border border-white/20">
            support@statbook.in
          </a>
        </div>
      </div>

    </div>
  )
}

export default function UserDashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
