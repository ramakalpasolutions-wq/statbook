'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, Stethoscope } from 'lucide-react'

const SPEC_META = {
  Cardiology:     { icon: '🫀', color: 'bg-red-50 border-red-200 text-red-700',         iconBg: 'bg-red-100' },
  Neurology:      { icon: '🧠', color: 'bg-purple-50 border-purple-200 text-purple-700', iconBg: 'bg-purple-100' },
  Orthopedics:    { icon: '🦴', color: 'bg-yellow-50 border-yellow-200 text-yellow-700', iconBg: 'bg-yellow-100' },
  Pediatrics:     { icon: '👶', color: 'bg-blue-50 border-blue-200 text-blue-700',       iconBg: 'bg-blue-100' },
  Dermatology:    { icon: '🧴', color: 'bg-pink-50 border-pink-200 text-pink-700',       iconBg: 'bg-pink-100' },
  Gynecology:     { icon: '🌸', color: 'bg-rose-50 border-rose-200 text-rose-700',       iconBg: 'bg-rose-100' },
  Ophthalmology:  { icon: '👁️', color: 'bg-cyan-50 border-cyan-200 text-cyan-700',       iconBg: 'bg-cyan-100' },
  ENT:            { icon: '👂', color: 'bg-orange-50 border-orange-200 text-orange-700', iconBg: 'bg-orange-100' },
  Dentistry:      { icon: '🦷', color: 'bg-teal-50 border-teal-200 text-teal-700',       iconBg: 'bg-teal-100' },
  Psychiatry:     { icon: '🧘', color: 'bg-indigo-50 border-indigo-200 text-indigo-700', iconBg: 'bg-indigo-100' },
  Oncology:       { icon: '🎗️', color: 'bg-violet-50 border-violet-200 text-violet-700', iconBg: 'bg-violet-100' },
  General:        { icon: '🏥', color: 'bg-gray-50 border-gray-200 text-gray-700',       iconBg: 'bg-gray-100' },
  Urology:        { icon: '🫁', color: 'bg-blue-50 border-blue-200 text-blue-700',       iconBg: 'bg-blue-100' },
  Nephrology:     { icon: '🫘', color: 'bg-green-50 border-green-200 text-green-700',    iconBg: 'bg-green-100' },
  Gastrology:     { icon: '🫃', color: 'bg-amber-50 border-amber-200 text-amber-700',    iconBg: 'bg-amber-100' },
  Pulmonology:    { icon: '🫁', color: 'bg-sky-50 border-sky-200 text-sky-700',          iconBg: 'bg-sky-100' },
  Endocrinology:  { icon: '⚗️', color: 'bg-lime-50 border-lime-200 text-lime-700',       iconBg: 'bg-lime-100' },
  Rheumatology:   { icon: '🦵', color: 'bg-orange-50 border-orange-200 text-orange-700', iconBg: 'bg-orange-100' },
}

const DEFAULT_META = { icon: '🏥', color: 'bg-teal-50 border-teal-200 text-teal-700', iconBg: 'bg-teal-100' }

export default function SpecializationsPage() {
  const [specializations, setSpecializations] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/specializations')
      .then(r => r.json())
      .then(d => {
        setSpecializations(d.specializations || [])
        setFiltered(d.specializations || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = e => {
    const val = e.target.value
    setSearch(val)
    setFiltered(
      specializations.filter(s => s.toLowerCase().includes(val.toLowerCase()))
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Specializations</h1>
        <p className="text-sm text-gray-400 mt-1">Find doctors by medical specialty</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text"
          placeholder="Search specialization..."
          value={search}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} specializations available</p>
        {search && (
          <button onClick={() => { setSearch(''); setFiltered(specializations) }}
            className="text-xs text-teal-600 hover:underline">Clear</button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array(12).fill(null).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Stethoscope size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No specializations found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map(spec => {
            const meta = SPEC_META[spec] || DEFAULT_META
            return (
              <Link key={spec}
                href={`/user/specializations/${encodeURIComponent(spec)}`}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer ${meta.color}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${meta.iconBg}`}>
                  {meta.icon}
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm leading-tight">{spec}</p>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
