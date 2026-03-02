'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Building2, MapPin, Clock, Phone, Globe, Video,
  AlertTriangle, Stethoscope, ChevronLeft
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function HospitalDetailPage() {
  const { hospitalId } = useParams()
  const router = useRouter()

  const [hospital, setHospital] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('OFFLINE')

  useEffect(() => {
    fetch(`/api/user/hospitals/${hospitalId}`)
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json() })
      .then(d => setHospital(d.hospital))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [hospitalId])

  const handleBookNow = (doctor) => {
    // Block if user selected Online but doctor doesn't support it
    if (selectedType === 'ONLINE' && !doctor.isOnlineConsultation) {
      toast.error('This doctor does not offer online consultation')
      return
    }

    const params = new URLSearchParams({
      hospitalId:   hospital.id,
      hospitalName: hospital.name,
      doctorId:     doctor.id,
      doctorName:   doctor.name,
      fee:          doctor.consultationFee,
      onlineFee:    doctor.onlineConsultationFee || 0,
      isOnline:     doctor.isOnlineConsultation ? 'true' : 'false',
      defaultType:  selectedType,
    })
    router.push(`/user/book?${params}`)
  }

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
    </div>
  )

  // ── Not found ─────────────────────────────────────────────
  if (!hospital) return (
    <div className="text-center py-16">
      <Building2 size={48} className="text-gray-200 mx-auto mb-3" />
      <p className="text-gray-400">Hospital not found</p>
      <button onClick={() => router.back()} className="mt-3 text-teal-600 hover:underline text-sm">
        Go back
      </button>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">

      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <ChevronLeft size={16} /> Back
      </button>

      {/* ── Hospital Header ───────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Building2 size={28} className="text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{hospital.name}</h1>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                  {hospital.type?.replace(/_/g, ' ')}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                hospital.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {hospital.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <span>{hospital.address}{hospital.city ? `, ${hospital.city}` : ''}{hospital.state ? `, ${hospital.state}` : ''}</span>
              </div>
              {hospital.timings && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" /><span>{hospital.timings}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                <a href={`tel:${hospital.phone}`} className="hover:text-teal-600">{hospital.phone}</a>
              </div>
              {hospital.website && (
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-gray-400" />
                  <a href={hospital.website} target="_blank" rel="noreferrer"
                    className="text-teal-600 hover:underline truncate">{hospital.website}</a>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {hospital.isOnline && (
                <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium border border-blue-100">
                  <Video size={11} /> Online Consultations Available
                </span>
              )}
              {hospital.isEmergency && (
                <span className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-medium border border-red-100">
                  <AlertTriangle size={11} /> 24/7 Emergency Services
                </span>
              )}
            </div>

            {/* Description */}
            {hospital.description && (
              <p className="mt-4 text-sm text-gray-500 leading-relaxed">{hospital.description}</p>
            )}

            {/* Facilities */}
            {hospital.facilities?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Facilities</p>
                <div className="flex flex-wrap gap-2">
                  {hospital.facilities.map(f => (
                    <span key={f} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Consultation Type Toggle ──────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Select Consultation Type</p>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setSelectedType('OFFLINE')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
              ${selectedType === 'OFFLINE'
                ? 'border-teal-500 bg-teal-50 text-teal-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
            <Building2 size={15} /> In-Hospital Visit
          </button>

          {hospital.isOnline && (
            <button onClick={() => setSelectedType('ONLINE')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                ${selectedType === 'ONLINE'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              <Video size={15} /> Online Consultation
            </button>
          )}
        </div>

        {selectedType === 'ONLINE' && (
          <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
            <Video size={11} /> Only doctors with online support can be booked online.
            A Google Meet link will be sent to your email after payment.
          </p>
        )}
      </div>

      {/* ── Doctors ───────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Stethoscope size={20} className="text-teal-600" />
          Our Doctors ({hospital.doctors?.length || 0})
        </h2>

        {hospital.doctors?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Stethoscope size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No doctors available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospital.doctors.map(doctor => {
              const isOnlineSelected = selectedType === 'ONLINE'
              const doctorSupportsOnline = doctor.isOnlineConsultation

              // Fee: if online selected AND doctor supports it → show online fee
              const displayFee = isOnlineSelected && doctorSupportsOnline
                ? (doctor.onlineConsultationFee || doctor.consultationFee)
                : doctor.consultationFee

              // Disable booking if online selected but doctor doesn't support
              const isDisabled = isOnlineSelected && !doctorSupportsOnline

              return (
                <div key={doctor.id}
                  className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${
                    isDisabled ? 'border-gray-100 opacity-70' : 'border-gray-100 hover:border-teal-200 hover:shadow-md'
                  }`}>

                  {/* Doctor Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Stethoscope size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800">Dr. {doctor.name}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {doctor.specializations?.map(s => (
                          <span key={s} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Doctor Info Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div>
                      <p className="text-gray-400">Experience</p>
                      <p className="font-semibold text-gray-700 mt-0.5">{doctor.experience} years</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Qualification</p>
                      <p className="font-semibold text-gray-700 mt-0.5">{doctor.qualification || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Availability</p>
                      <p className="font-semibold text-gray-700 mt-0.5">
                        {doctor.availabilityType === 'INTERVAL'
                          ? `${doctor.startTime} - ${doctor.endTime}`
                          : 'Full Day'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">
                        {isOnlineSelected && doctorSupportsOnline ? 'Online Fee' : 'Fee'}
                      </p>
                      <p className="font-bold text-teal-700 text-sm mt-0.5">₹{displayFee}</p>
                    </div>
                  </div>

                  {/* Online badge */}
                  {doctorSupportsOnline && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100 font-medium">
                        <Video size={10} /> Online Available — ₹{doctor.onlineConsultationFee || doctor.consultationFee}
                      </span>
                    </div>
                  )}

                  {/* Book Button */}
                  <button
                    onClick={() => handleBookNow(doctor)}
                    disabled={isDisabled}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-colors
                      ${isDisabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isOnlineSelected
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-teal-600 hover:bg-teal-700 text-white'
                      }`}>
                    {isDisabled
                      ? '🚫 Online Not Available'
                      : isOnlineSelected
                        ? `🖥️ Book Online — ₹${displayFee}`
                        : `🏥 Book Now — ₹${displayFee}`
                    }
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
