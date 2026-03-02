'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Search, MapPin, Clock, Phone, Building2,
  Video, AlertTriangle, Navigation, Loader2, X
} from 'lucide-react'

const HOSPITAL_TYPES = ['ALL', 'MULTI_SPECIALITY', 'NORMAL', 'CLINIC']

function getDistanceLabel(km) {
  if (km === null || km === undefined) return null
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km} km`
}

function HospitalsContent() {
  const searchParams = useSearchParams()

  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [emergencyOnly, setEmergencyOnly] = useState(false)
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null, city: null })
  const [locationLoading, setLocationLoading] = useState(true)

  const loadHospitals = useCallback(async (
    searchVal = '', loc = {}, type = 'ALL', online = false, emergency = false
  ) => {
    setLoading(true)
    try {
      const q = new URLSearchParams()
      if (searchVal)  q.set('search', searchVal)
      if (loc.lat)    q.set('lat', loc.lat)
      if (loc.lng)    q.set('lng', loc.lng)
      if (loc.city)   q.set('city', loc.city)
      if (online)     q.set('type', 'online')
      if (emergency)  q.set('type', 'emergency')
      const res  = await fetch(`/api/user/hospitals?${q}`)
      const data = await res.json()
      let list = data.hospitals || []
      if (type !== 'ALL') list = list.filter(h => h.type === type)
      setHospitals(list)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  // ── Detect location + read ?type param on mount ───────────
  useEffect(() => {
    const typeParam = searchParams.get('type') // 'online' | 'emergency' | null

    // Pre-set toggles from URL param
    if (typeParam === 'online')    setOnlineOnly(true)
    if (typeParam === 'emergency') setEmergencyOnly(true)

    const initLoad = (loc) => {
      if (typeParam === 'online') {
        loadHospitals('', loc, 'ALL', true, false)
      } else if (typeParam === 'emergency') {
        loadHospitals('', loc, 'ALL', false, true)
      } else {
        loadHospitals('', loc)
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, city: null }
          setUserLocation(loc)
          initLoad(loc)
          setLocationLoading(false)
        },
        () => {
          fetch('/api/user/me')
            .then(r => r.json())
            .then(d => {
              const city = d.user?.location || null
              const loc  = { lat: null, lng: null, city }
              setUserLocation(loc)
              initLoad(loc)
            })
            .catch(() => initLoad({}))
            .finally(() => setLocationLoading(false))
        },
        { timeout: 5000 }
      )
    } else {
      initLoad({})
      setLocationLoading(false)
    }
  }, [searchParams])

  const handleSearch = e => {
    e.preventDefault()
    loadHospitals(search, userLocation, typeFilter, onlineOnly, emergencyOnly)
  }

  const handleFilter = (type) => {
    setTypeFilter(type)
    loadHospitals(search, userLocation, type, onlineOnly, emergencyOnly)
  }

  const handleToggle = (key) => {
    const newOnline    = key === 'online'    ? !onlineOnly    : onlineOnly
    const newEmergency = key === 'emergency' ? !emergencyOnly : emergencyOnly
    if (key === 'online')    setOnlineOnly(newOnline)
    if (key === 'emergency') setEmergencyOnly(newEmergency)
    loadHospitals(search, userLocation, typeFilter, newOnline, newEmergency)
  }

  const clearFilters = () => {
    setSearch(''); setTypeFilter('ALL'); setOnlineOnly(false); setEmergencyOnly(false)
    loadHospitals('', userLocation, 'ALL', false, false)
  }

  const hasFilters = search || typeFilter !== 'ALL' || onlineOnly || emergencyOnly

  // Page title based on active filter
  const pageTitle = onlineOnly
    ? '🖥️ Online Consultations'
    : emergencyOnly
      ? '🚨 Emergency Hospitals'
      : '🏥 Hospitals'

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
        <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
          {locationLoading
            ? <><Loader2 size={13} className="animate-spin" /> Detecting location...</>
            : userLocation.lat
              ? <><Navigation size={13} className="text-teal-600" /> Sorted by distance from you</>
              : userLocation.city
                ? <><MapPin size={13} className="text-teal-600" /> Showing hospitals in {userLocation.city}</>
                : <><MapPin size={13} /> All hospitals</>
          }
        </p>
      </div>

      {/* Online filter active banner */}
      {onlineOnly && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <Video size={15} className="text-indigo-600 flex-shrink-0" />
          <p className="text-sm text-indigo-700 font-medium">
            Showing hospitals with online consultation available
          </p>
          <button onClick={clearFilters}
            className="ml-auto text-xs text-indigo-400 hover:text-indigo-700 flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        </div>
      )}

      {/* Emergency filter active banner */}
      {emergencyOnly && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={15} className="text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            Showing 24/7 emergency hospitals only
          </p>
          <button onClick={clearFilters}
            className="ml-auto text-xs text-red-400 hover:text-red-700 flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text"
            placeholder="Search by name, city, state..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <button type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors">
          Search
        </button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {HOSPITAL_TYPES.map(t => (
          <button key={t} onClick={() => handleFilter(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors
              ${typeFilter === t
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'}`}>
            {t === 'ALL' ? 'All Types' : t.replace(/_/g, ' ')}
          </button>
        ))}

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button onClick={() => handleToggle('online')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors
            ${onlineOnly
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
          <Video size={13} /> Online
        </button>

        <button onClick={() => handleToggle('emergency')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors
            ${emergencyOnly
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'}`}>
          <AlertTriangle size={13} /> Emergency
        </button>

        {hasFilters && (
          <button onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 ml-1">
            <X size={13} /> Clear all
          </button>
        )}

        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {hospitals.length} found
        </span>
      </div>

      {/* Hospital Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(9).fill(null).map((_, i) => (
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
              <div className="h-9 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : hospitals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Building2 size={52} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No hospitals found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          <button onClick={clearFilters}
            className="mt-4 text-teal-600 text-sm hover:underline">
            Clear all filters
          </button>
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
                  <h3 className="font-bold text-gray-800 truncate group-hover:text-teal-700 text-sm">
                    {h.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                      {h.type?.replace(/_/g, ' ')}
                    </span>
                    {h.distanceKm !== null && (
                      <span className="text-xs text-teal-600 font-bold flex items-center gap-1">
                        <Navigation size={10} />{getDistanceLabel(h.distanceKm)}
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
                  Book Now <Navigation size={10} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HospitalsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    }>
      <HospitalsContent />
    </Suspense>
  )
}
