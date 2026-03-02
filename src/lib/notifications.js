import { sendOTPSMS as sendSMSNotification } from './sms'
import { sendOTPEmail } from './mailer'

export async function sendBookingConfirmation({ userName, userPhone, userEmail, doctorName, date, time, consultationId }) {
  const msg = `Hi ${userName}, your consultation with Dr. ${doctorName} is confirmed on ${date} at ${time}. ID: ${consultationId}. - STAT BOOK`

  await Promise.allSettled([
    sendSMSNotification(userPhone, msg),
    sendOTPEmail(userEmail, `Booking Confirmed — ${consultationId}`, `
      <div style="font-family:sans-serif;padding:20px;">
        <h2 style="color:#0d9488;">STAT BOOK — Booking Confirmed</h2>
        <p>Hi <b>${userName}</b>,</p>
        <p>Your consultation has been confirmed:</p>
        <table style="border-collapse:collapse;width:100%;margin-top:10px;">
          <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Consultation ID</td><td style="padding:8px;border:1px solid #e5e7eb;">${consultationId}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Doctor</td><td style="padding:8px;border:1px solid #e5e7eb;">Dr. ${doctorName}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Date</td><td style="padding:8px;border:1px solid #e5e7eb;">${date}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Time</td><td style="padding:8px;border:1px solid #e5e7eb;">${time}</td></tr>
        </table>
        <p style="margin-top:16px;color:#6b7280;font-size:13px;">Please arrive 10 minutes early.</p>
      </div>
    `),
  ])
}

export async function sendCancellationNotification({ userName, userPhone, userEmail, doctorName, date, time, cancelledBy }) {
  const msg = `Hi ${userName}, your consultation with Dr. ${doctorName} on ${date} at ${time} has been cancelled by ${cancelledBy}. - STAT BOOK`

  await Promise.allSettled([
    sendSMSNotification(userPhone, msg),
    sendOTPEmail(userEmail, 'Consultation Cancelled — STAT BOOK', `
      <div style="font-family:sans-serif;padding:20px;">
        <h2 style="color:#ef4444;">STAT BOOK — Consultation Cancelled</h2>
        <p>Hi <b>${userName}</b>, your consultation with Dr. <b>${doctorName}</b> on <b>${date}</b> at <b>${time}</b> has been cancelled by <b>${cancelledBy}</b>.</p>
        <p style="color:#6b7280;font-size:13px;">Please contact the hospital to reschedule.</p>
      </div>
    `),
  ])
}

export async function sendRescheduleNotification({ userName, userPhone, userEmail, doctorName, newDate, newTime }) {
  const msg = `Hi ${userName}, your consultation with Dr. ${doctorName} has been rescheduled to ${newDate} at ${newTime}. - STAT BOOK`

  await Promise.allSettled([
    sendSMSNotification(userPhone, msg),
    sendOTPEmail(userEmail, 'Consultation Rescheduled — STAT BOOK', `
      <div style="font-family:sans-serif;padding:20px;">
        <h2 style="color:#2563eb;">STAT BOOK — Consultation Rescheduled</h2>
        <p>Hi <b>${userName}</b>, your consultation with Dr. <b>${doctorName}</b> has been rescheduled to <b>${newDate}</b> at <b>${newTime}</b>.</p>
      </div>
    `),
  ])
}

export async function sendDoctorAcceptanceNotification({ userName, userPhone, userEmail, doctorName, date, time }) {
  const msg = `Hi ${userName}, Dr. ${doctorName} has accepted your consultation on ${date} at ${time}. - STAT BOOK`

  await Promise.allSettled([
    sendSMSNotification(userPhone, msg),
    sendOTPEmail(userEmail, 'Doctor Accepted — STAT BOOK', `
      <div style="font-family:sans-serif;padding:20px;">
        <h2 style="color:#16a34a;">STAT BOOK — Doctor Accepted</h2>
        <p>Hi <b>${userName}</b>, Dr. <b>${doctorName}</b> has accepted your consultation on <b>${date}</b> at <b>${time}</b>.</p>
      </div>
    `),
  ])
}

export async function sendReminderNotification({ userName, userPhone, userEmail, doctorName, time }) {
  const msg = `Reminder: Hi ${userName}, your consultation with Dr. ${doctorName} is in 1 hour at ${time}. - STAT BOOK`

  await Promise.allSettled([
    sendSMSNotification(userPhone, msg),
    sendOTPEmail(userEmail, 'Consultation Reminder — STAT BOOK', `
      <div style="font-family:sans-serif;padding:20px;">
        <h2 style="color:#d97706;">STAT BOOK — Reminder</h2>
        <p>Hi <b>${userName}</b>, your consultation with Dr. <b>${doctorName}</b> is in <b>1 hour</b> at <b>${time}</b>. Please be ready.</p>
      </div>
    `),
  ])
}
