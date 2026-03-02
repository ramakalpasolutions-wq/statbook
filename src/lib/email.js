import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// ── Booking Confirmation (In-Hospital) ────────────────────────
export async function sendBookingConfirmation({ userName, userEmail, doctorName, hospitalName, date, time, consultationId, type }) {
  await transporter.sendMail({
    from: `"STAT BOOK" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `✅ Appointment Confirmed — ${consultationId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:20px;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#0d9488,#1d4ed8);padding:24px;border-radius:10px;text-align:center;margin-bottom:20px;">
          <h1 style="color:white;margin:0;font-size:22px;">Appointment Confirmed ✅</h1>
          <p style="color:#99f6e4;margin:6px 0 0;font-size:14px;">STAT BOOK Healthcare</p>
        </div>
        <div style="background:white;padding:24px;border-radius:10px;margin-bottom:16px;">
          <p style="color:#374151;font-size:15px;margin:0 0 16px;">Dear <strong>${userName}</strong>,</p>
          <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">Your appointment has been confirmed. Here are your booking details:</p>
          <table style="width:100%;border-collapse:collapse;">
            ${[
              ['Booking ID', consultationId],
              ['Doctor', `Dr. ${doctorName}`],
              ['Hospital', hospitalName],
              ['Date', date],
              ['Time', time],
              ['Type', type === 'ONLINE' ? '🖥️ Online Consultation' : '🏥 In-Hospital Visit'],
            ].map(([label, value]) => `
              <tr style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:10px 0;color:#9ca3af;font-size:13px;width:40%;">${label}</td>
                <td style="padding:10px 0;color:#111827;font-size:13px;font-weight:600;">${value}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        <div style="text-align:center;padding:16px;color:#9ca3af;font-size:12px;">
          © 2026 STAT BOOK. All rights reserved. | support@statbook.in
        </div>
      </div>
    `,
  })
}

// ── Online Consultation with Meet Link ────────────────────────
export async function sendOnlineConsultationEmail({ userName, userEmail, doctorName, hospitalName, date, time, consultationId, meetLink }) {
  await transporter.sendMail({
    from: `"STAT BOOK" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `🖥️ Online Consultation Confirmed — ${consultationId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:20px;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#0d9488,#1d4ed8);padding:24px;border-radius:10px;text-align:center;margin-bottom:20px;">
          <h1 style="color:white;margin:0;font-size:22px;">Online Consultation Confirmed 🖥️</h1>
          <p style="color:#99f6e4;margin:6px 0 0;font-size:14px;">STAT BOOK Healthcare</p>
        </div>

        <div style="background:white;padding:24px;border-radius:10px;margin-bottom:16px;">
          <p style="color:#374151;font-size:15px;margin:0 0 16px;">Dear <strong>${userName}</strong>,</p>
          <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">Your online consultation has been confirmed. Join using the Google Meet link below at the scheduled time.</p>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            ${[
              ['Booking ID', consultationId],
              ['Doctor', `Dr. ${doctorName}`],
              ['Hospital', hospitalName],
              ['Date', date],
              ['Time', time],
            ].map(([label, value]) => `
              <tr style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:10px 0;color:#9ca3af;font-size:13px;width:40%;">${label}</td>
                <td style="padding:10px 0;color:#111827;font-size:13px;font-weight:600;">${value}</td>
              </tr>
            `).join('')}
          </table>

          <!-- Meet Link CTA -->
          <div style="background:#eff6ff;border:2px solid #bfdbfe;border-radius:10px;padding:20px;text-align:center;">
            <p style="color:#1d4ed8;font-size:14px;font-weight:600;margin:0 0 12px;">🎥 Join Your Consultation</p>
            <a href="${meetLink}"
              style="display:inline-block;background:#1d4ed8;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;letter-spacing:0.5px;">
              Join Google Meet
            </a>
            <p style="color:#6b7280;font-size:11px;margin:12px 0 0;word-break:break-all;">${meetLink}</p>
          </div>
        </div>

        <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:10px;padding:16px;margin-bottom:16px;">
          <p style="color:#92400e;font-size:13px;margin:0;"><strong>⚠️ Important:</strong> Please join the meeting 5 minutes before your scheduled time. Make sure your camera and microphone are working.</p>
        </div>

        <div style="text-align:center;padding:16px;color:#9ca3af;font-size:12px;">
          © 2026 STAT BOOK. All rights reserved. | support@statbook.in
        </div>
      </div>
    `,
  })
}
