'use client'
import { X, Check, XCircle, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function ConsultationDetailModal({ consultation: c, onClose, onUpdate }) {
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [showReschedule, setShowReschedule] = useState(false)

  const handleReschedule = () => {
    if (!rescheduleDate || !rescheduleTime) return
    onUpdate(c.id, 'RESCHEDULED', {
      date: new Date(rescheduleDate),
      time: rescheduleTime,
      rescheduledBy: 'Admin',
    })
  }

  const statusColors = {
    COMPLETED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    ACCEPTED: 'bg-teal-100 text-teal-700',
    CANCELLED: 'bg-red-100 text-red-700',
    RESCHEDULED: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-bold text-gray-800 text-lg">Consultation Details</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* ID + Status */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-500">{c.consultationId}</span>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[c.status]}`}>
              {c.status}
            </span>
          </div>

          {/* Patient Info */}
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-blue-500 font-medium mb-2">PATIENT</p>
            <p className="font-bold text-gray-800">{c.user?.name}</p>
            {c.patientName && c.patientName !== c.user?.name && (
              <p className="text-sm text-gray-600 mt-1">For: {c.patientName} ({c.patientRelation})</p>
            )}
            <p className="text-sm text-gray-500 mt-1">{c.user?.phone}</p>
          </div>

          {/* Doctor Info */}
          <div className="bg-teal-50 rounded-xl p-4">
            <p className="text-xs text-teal-500 font-medium mb-2">DOCTOR</p>
            <p className="font-bold text-gray-800">{c.doctor?.name}</p>
            <p className="text-sm text-gray-600">{c.doctor?.specializations?.join(', ')}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Date', new Date(c.date).toLocaleDateString('en-IN')],
              ['Time', c.time],
              ['Type', c.type],
              ['Fee', `₹${c.fee}`],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-semibold text-gray-700 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Online Meet Link */}
          {c.type === 'ONLINE' && c.meetLink && (
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-blue-500 font-medium mb-1">Meet Link</p>
              <a href={c.meetLink} target="_blank" rel="noreferrer"
                className="text-sm text-blue-600 hover:underline break-all">
                {c.meetLink}
              </a>
            </div>
          )}

          {/* Description */}
          {c.description && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Reason</p>
              <p className="text-sm text-gray-700">{c.description}</p>
            </div>
          )}

          {/* Cancellation info */}
          {c.status === 'CANCELLED' && c.cancelledBy && (
            <div className="bg-red-50 rounded-xl p-3 text-sm">
              <p className="text-red-600 font-medium">Cancelled by: {c.cancelledBy}</p>
              {c.cancelledByName && <p className="text-red-400 text-xs">{c.cancelledByName}</p>}
            </div>
          )}

          {/* Reschedule Form */}
          {showReschedule && (
            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50 space-y-3">
              <p className="text-sm font-medium text-blue-800">Reschedule Consultation</p>
              <input type="date" value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="New time (e.g. 10:00 AM)"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex gap-2">
                <button onClick={handleReschedule}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
                  Confirm Reschedule
                </button>
                <button onClick={() => setShowReschedule(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(c.status === 'PENDING' || c.status === 'ACCEPTED') && !showReschedule && (
            <div className="flex gap-2 pt-2">
              {c.status === 'PENDING' && (
                <button onClick={() => onUpdate(c.id, 'ACCEPTED')}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-medium">
                  <Check size={15} /> Accept
                </button>
              )}
              {c.status === 'ACCEPTED' && (
                <button onClick={() => onUpdate(c.id, 'COMPLETED')}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-medium">
                  <Check size={15} /> Complete
                </button>
              )}
              <button onClick={() => setShowReschedule(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium">
                <RefreshCw size={15} /> Reschedule
              </button>
              <button onClick={() => onUpdate(c.id, 'CANCELLED', { cancelledBy: 'ADMIN' })}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-medium">
                <XCircle size={15} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
