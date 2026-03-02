'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Building2, Stethoscope, Calendar, Clock, User, ChevronLeft, Video, Hospital } from 'lucide-react'
import toast from 'react-hot-toast'

function BookingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const hospitalId   = searchParams.get('hospitalId')
  const hospitalName = searchParams.get('hospitalName')
  const doctorId     = searchParams.get('doctorId')
  const doctorName   = searchParams.get('doctorName')

  // Doctor fees from URL (passed from hospital detail page)
  const offlineFee = parseFloat(searchParams.get('fee') || '0')
  const onlineFee  = parseFloat(searchParams.get('onlineFee') || '0')
  const isOnlineAvailable = searchParams.get('isOnline') === 'true'

  const [user, setUser] = useState(null)
  const [form, setForm] = useState({
    consultationType: 'OFFLINE', // OFFLINE | ONLINE
    date: '',
    time: '',
    patientType: 'self',
    familyMemberId: '',
    patientName: '',
    patientRelation: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)

  // Current fee based on selected type
  const currentFee = form.consultationType === 'ONLINE' ? onlineFee : offlineFee

  useEffect(() => {
    fetch('/api/user/me')
      .then(r => r.json())
      .then(d => setUser(d.user))
      .catch(() => {})
  }, [])

  const selectedPatientName = form.patientType === 'self'
    ? user?.name
    : user?.familyMembers?.find(f => f.id === form.familyMemberId)?.name || ''

  const handleBook = async () => {
    if (!form.date || !form.time) return toast.error('Please select date and time')
    if (form.patientType === 'family' && !form.familyMemberId && !form.patientName) {
      return toast.error('Please select or enter patient details')
    }
    if (form.consultationType === 'ONLINE' && !onlineFee) {
      return toast.error('Online consultation fee not available')
    }

    setLoading(true)
    try {
      const res = await fetch('/api/user/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId,
          doctorId,
          date: form.date,
          time: form.time,
          type: form.consultationType,
          fee: currentFee,
          patientName: form.patientType === 'self'
            ? user?.name
            : (selectedPatientName || form.patientName),
          patientRelation: form.patientType === 'self' ? 'Self' : form.patientRelation,
          description: form.description || null,
        }),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Booking failed')
      }

      const data = await res.json()

      // Load Razorpay & open payment
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          name: 'STAT BOOK',
          description: `${form.consultationType === 'ONLINE' ? 'Online' : 'In-Hospital'} Consultation with Dr. ${doctorName}`,
          prefill: { name: user?.name, email: user?.email, contact: user?.phone },
          theme: { color: '#0d9488' },
          handler: async (response) => {
            const verifyRes = await fetch('/api/user/payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId:   response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                consultationId:    data.consultationId,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyRes.ok) {
              router.push(`/user/payment/success?consultationId=${verifyData.consultationId}&type=${form.consultationType}&meetLink=${encodeURIComponent(verifyData.meetLink || '')}`)
            } else {
              toast.error(verifyData.error || 'Payment verification failed')
            }
          },
          modal: {
            ondismiss: async () => {
              const retryRes = await fetch('/api/user/payment', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ razorpayOrderId: data.orderId }),
              })
              const retryData = await retryRes.json()
              if (!retryRes.ok) {
                toast.error(retryData.error || 'No more retries. Please rebook.')
                router.push(`/user/hospitals/${hospitalId}`)
              } else {
                toast.error(`Payment cancelled. ${retryData.retriesLeft} retry(s) left.`)
              }
            },
          },
        })
        rzp.open()
      }
      document.body.appendChild(script)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">

      {/* Header */}
      <div>
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-3">
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Book Consultation</h1>
        <p className="text-sm text-gray-500">Fill in the details to confirm your appointment</p>
      </div>

      {/* ── Consultation Type Toggle ───────────────────────── */}
      {isOnlineAvailable ? (
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            Consultation Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                type: 'OFFLINE',
                label: 'In-Hospital Visit',
                icon: '🏥',
                desc: 'Visit the hospital in person',
                fee: offlineFee,
                color: form.consultationType === 'OFFLINE'
                  ? 'border-teal-500 bg-teal-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-teal-300',
                badge: 'bg-teal-100 text-teal-700',
              },
              {
                type: 'ONLINE',
                label: 'Online Consultation',
                icon: '🖥️',
                desc: 'Video call via Google Meet',
                fee: onlineFee,
                color: form.consultationType === 'ONLINE'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300',
                badge: 'bg-blue-100 text-blue-700',
              },
            ].map(opt => (
              <button key={opt.type} type="button"
                onClick={() => setForm({ ...form, consultationType: opt.type })}
                className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 transition-all text-left ${opt.color}`}>
                <div className="flex items-center gap-2 w-full">
                  <span className="text-2xl">{opt.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-800 leading-tight">{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </div>
                  {form.consultationType === opt.type && (
                    <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <div className={`text-xs px-2.5 py-1 rounded-full font-bold ${opt.badge}`}>
                  ₹{opt.fee} / session
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Doctor only does in-hospital */
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-2">
          <span className="text-lg">🏥</span>
          <p className="text-sm text-gray-600">
            <strong>In-Hospital Visit only</strong> — this doctor doesn't offer online consultation
          </p>
        </div>
      )}

      {/* ── Booking Summary Card ──────────────────────────── */}
      <div className={`rounded-2xl p-5 border ${
        form.consultationType === 'ONLINE'
          ? 'bg-blue-50 border-blue-200'
          : 'bg-teal-50 border-teal-200'
      }`}>
        <h2 className={`font-semibold mb-3 ${
          form.consultationType === 'ONLINE' ? 'text-blue-800' : 'text-teal-800'
        }`}>
          Appointment Summary
        </h2>
        <div className="space-y-2 text-sm">
          <div className={`flex items-center gap-2 ${
            form.consultationType === 'ONLINE' ? 'text-blue-700' : 'text-teal-700'
          }`}>
            <Building2 size={14} /><span>{hospitalName}</span>
          </div>
          <div className={`flex items-center gap-2 ${
            form.consultationType === 'ONLINE' ? 'text-blue-700' : 'text-teal-700'
          }`}>
            <Stethoscope size={14} /><span>Dr. {doctorName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              form.consultationType === 'ONLINE'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-teal-100 text-teal-700'
            }`}>
              {form.consultationType === 'ONLINE' ? '🖥️ Online via Google Meet' : '🏥 In-Hospital Visit'}
            </span>
          </div>
          <div className={`flex items-center justify-between pt-2 border-t ${
            form.consultationType === 'ONLINE' ? 'border-blue-200' : 'border-teal-200'
          }`}>
            <span className={form.consultationType === 'ONLINE' ? 'text-blue-600 font-medium' : 'text-teal-600 font-medium'}>
              Consultation Fee
            </span>
            <span className={`text-xl font-bold ${
              form.consultationType === 'ONLINE' ? 'text-blue-800' : 'text-teal-800'
            }`}>
              ₹{currentFee}
            </span>
          </div>
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Date *</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="date"
                min={new Date().toISOString().split('T')[0]}
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Time *</label>
            <div className="relative">
              <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="time"
                value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
        </div>

        {/* Patient Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Patient *</label>
          <div className="flex gap-3 mb-3">
            <button type="button"
              onClick={() => setForm({ ...form, patientType: 'self' })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all
                ${form.patientType === 'self'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-200 text-gray-600 hover:border-teal-300'}`}>
              <User size={14} /> Self ({user?.name || '...'})
            </button>
            <button type="button"
              onClick={() => setForm({ ...form, patientType: 'family' })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all
                ${form.patientType === 'family'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-200 text-gray-600 hover:border-teal-300'}`}>
              <User size={14} /> Family Member
            </button>
          </div>

          {form.patientType === 'family' && (
            <div className="space-y-3">
              {user?.familyMembers?.length > 0 && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Select Family Member</label>
                  <select
                    value={form.familyMemberId}
                    onChange={e => setForm({ ...form, familyMemberId: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">Select member...</option>
                    {user.familyMembers.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.relation})</option>
                    ))}
                    <option value="new">+ Add new patient manually</option>
                  </select>
                </div>
              )}
              {(!form.familyMemberId || form.familyMemberId === 'new') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Patient Name</label>
                    <input type="text" placeholder="Full name"
                      value={form.patientName}
                      onChange={e => setForm({ ...form, patientName: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Relation</label>
                    <input type="text" placeholder="e.g. Father, Mother"
                      value={form.patientRelation}
                      onChange={e => setForm({ ...form, patientRelation: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            placeholder="Describe your symptoms or reason for visit..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
        </div>

        {/* Online note */}
        {form.consultationType === 'ONLINE' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
            <span className="text-lg">🖥️</span>
            <div>
              <p className="text-xs font-semibold text-blue-800">Online Consultation Info</p>
              <p className="text-xs text-blue-600 mt-0.5">
                A Google Meet link will be generated after payment and sent to your registered email address. Please join 5 minutes before your appointment time.
              </p>
            </div>
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handleBook}
          disabled={loading}
          className={`w-full text-white py-3.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2
            ${form.consultationType === 'ONLINE'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-teal-600 hover:bg-teal-700'}`}>
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
          ) : (
            <>{form.consultationType === 'ONLINE' ? '🖥️' : '🏥'} Pay ₹{currentFee} & Book</>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Secure payment powered by Razorpay. You'll receive confirmation via SMS & email.
        </p>
      </div>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  )
}
