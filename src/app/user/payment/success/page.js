'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Home, CalendarDays, ExternalLink, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

function SuccessContent() {
  const searchParams  = useSearchParams()
  const router        = useRouter()

  const consultationId = searchParams.get('consultationId')
  const type           = searchParams.get('type') || 'OFFLINE'
  const meetLink       = searchParams.get('meetLink') ? decodeURIComponent(searchParams.get('meetLink')) : null

  const isOnline = type === 'ONLINE'
  const [copied, setCopied] = useState(false)

  const copyMeetLink = () => {
    if (!meetLink) return
    navigator.clipboard.writeText(meetLink).then(() => {
      setCopied(true)
      toast.success('Meet link copied!')
      setTimeout(() => setCopied(false), 3000)
    })
  }

  return (
    <div className="max-w-md mx-auto py-10 space-y-4">

      {/* ── Main Card ─────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">

        {/* Success Icon */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
          isOnline ? 'bg-blue-100' : 'bg-green-100'
        }`}>
          <CheckCircle size={40} className={isOnline ? 'text-blue-600' : 'text-green-600'} />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isOnline ? 'Online Consultation Confirmed! 🖥️' : 'Booking Confirmed! 🎉'}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {isOnline
            ? 'Your online consultation has been booked. Google Meet link has been sent to your registered email.'
            : 'Your appointment has been successfully booked. Confirmation sent to your email and phone.'}
        </p>

        {/* Booking ID */}
        {consultationId && (
          <div className="bg-teal-50 rounded-xl p-4 mb-5 text-left">
            <p className="text-xs text-teal-600 font-semibold mb-1 uppercase tracking-wide">Booking ID</p>
            <p className="font-mono font-bold text-teal-800 text-lg">{consultationId}</p>
          </div>
        )}

        {/* ── Google Meet Link Block (Online only) ────────── */}
        {isOnline && meetLink && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mb-5 text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎥</span>
              <div>
                <p className="text-sm font-bold text-blue-800">Your Google Meet Link</p>
                <p className="text-xs text-blue-500">Join at your scheduled appointment time</p>
              </div>
            </div>

            {/* Meet link display */}
            <div className="bg-white border border-blue-200 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2 mb-3">
              <p className="text-xs text-blue-700 font-mono truncate flex-1">{meetLink}</p>
              <button onClick={copyMeetLink}
                className="flex-shrink-0 text-blue-500 hover:text-blue-700 transition-colors">
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>

            {/* Join button */}
            <a href={meetLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors">
              <ExternalLink size={15} /> Join Google Meet
            </a>

            <p className="text-xs text-blue-400 mt-2 text-center">
              Link also sent to your registered email
            </p>
          </div>
        )}

        {/* What's next */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5 text-left space-y-2">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">What's Next?</p>
          {[
            { icon: '✅', text: 'Confirmation SMS & email sent' },
            { icon: '📅', text: 'Check your profile for appointment details' },
            ...(isOnline
              ? [
                  { icon: '🖥️', text: 'Join via the Google Meet link above or from your email' },
                  { icon: '⏰', text: 'Join 5 minutes before your scheduled time' },
                  { icon: '🎤', text: 'Ensure camera & microphone are working' },
                ]
              : [
                  { icon: '⏰', text: 'Arrive 10 minutes early for your visit' },
                  { icon: '📋', text: 'Carry any previous prescriptions if applicable' },
                ]
            ),
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-sm">{item.icon}</span>
              <p className="text-xs text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/user/profile')}
            className="flex-1 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5">
            <CalendarDays size={14} /> My Bookings
          </button>
          <button
            onClick={() => router.push('/user/dashboard')}
            className={`flex-1 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5
              ${isOnline ? 'bg-blue-600 hover:bg-blue-700' : 'bg-teal-600 hover:bg-teal-700'}`}>
            <Home size={14} /> Home
          </button>
        </div>
      </div>

      {/* ── Bottom note ───────────────────────────────────── */}
      <p className="text-center text-xs text-gray-400">
        Having trouble? Contact us at{' '}
        <a href="mailto:support@statbook.in" className="text-teal-600 hover:underline">
          support@statbook.in
        </a>
      </p>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
