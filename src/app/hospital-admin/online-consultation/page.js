'use client'
import { Video } from 'lucide-react'

export default function OnlineConsultationPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Online Consultation</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <Video size={56} className="mx-auto text-teal-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Google Meet Integration</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Confirmed bookings automatically create a Google Calendar event with a Meet link
          attached. Guests (Doctor + Patient) receive email invitations.
        </p>
        <div className="mt-6 bg-teal-50 border border-teal-200 rounded-lg p-4 text-left max-w-sm mx-auto">
          <p className="text-xs font-semibold text-teal-800 mb-2">Setup Required:</p>
          <ul className="text-xs text-teal-700 space-y-1">
            <li>• Enable Google Calendar API</li>
            <li>• Add GOOGLE_CLIENT_ID to .env</li>
            <li>• Add GOOGLE_CLIENT_SECRET to .env</li>
            <li>• Configure OAuth consent screen</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
