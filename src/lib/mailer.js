import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendOTPEmail(email, subject, html) {
  // Support both old OTP calls and new notification calls
  const isOTP = !html
  const finalHtml = html || `
    <div style="font-family:sans-serif;padding:20px;max-width:400px;">
      <h2 style="color:#2563eb;">STAT BOOK</h2>
      <p>Your OTP code is:</p>
      <h1 style="letter-spacing:8px;color:#1e40af;">${subject}</h1>
      <p>This OTP expires in <b>10 minutes</b>.</p>
    </div>
  `
  const finalSubject = isOTP ? 'Your OTP Verification Code — STAT BOOK' : subject

  await transporter.sendMail({
    from: `"STAT BOOK" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: finalSubject,
    html: finalHtml,
  })
}
