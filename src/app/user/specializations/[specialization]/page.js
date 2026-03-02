'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, MapPin, Clock, Phone, Video, AlertTriangle, ChevronLeft, ArrowRight } from 'lucide-react'

export default function SpecializationPage() {
  const { specialization } = useParams()
  const router = useRouter()
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const spec = decodeURIComponent(specialization)

  useEffect(() => {
    fetch(`/api/user/hospitals?specialization=${encodeURIComponent(spec)}`)
      .then(r => r.json())
      .then(d => setHospitals(d.hospitals || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [spec])

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-3">
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{spec} Hospitals</h1>
        <p className="text-sm text-gray-500 mt-1">{hospitals.length} hospitals found with {spec} specialists</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(null).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : hospitals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Building2 size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No hospitals found for {spec}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospitals.map(h => (
            <Link key={h.id} href={`/user/hospitals/${h.id}`}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all group">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 size={20} className="text-teal-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-800 truncate group-hover:text-teal-700">{h.name}</h3>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{h.type?.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <div className="space-y-1 text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1.5"><MapPin size={11} /><span className="truncate">{h.address}</span></div>
                {h.timings && <div className="flex items-center gap-1.5"><Clock size={11} /><span>{h.timings}</span></div>}
                <div className="flex items-center gap-1.5"><Phone size={11} /><span>{h.phone}</span></div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                {h.isOnline && <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"><Video size={9} /> Online</span>}
                {h.isEmergency && <span className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full"><AlertTriangle size={9} /> Emergency</span>}
                <span className="ml-auto flex items-center gap-1 text-xs text-teal-600 font-medium">View <ArrowRight size={11} /></span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
