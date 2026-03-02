import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOTPEmail } from '@/lib/mailer'

import { generateOTP, getOTPExpiry } from '@/lib/otpHelper'
import { sendOTPSMS } from '@/lib/sms'

export async function POST(req) {
  const { type, email, phone, otp, action } = await req.json()

  if (action === 'send') {
    const code = generateOTP()
    const expiry = getOTPExpiry()

    // Find user if exists (for non-register flows)
    let userId = 'temp'
    if (email) {
      const user = await prisma.user.findUnique({ where: { email } })
      if (user) userId = user.id
    } else if (phone) {
      const user = await prisma.user.findUnique({ where: { phone } })
      if (user) userId = user.id
    }

    // Delete old OTPs of same type to avoid clutter
    if (userId !== 'temp') {
      await prisma.oTP.deleteMany({
        where: { userId, type, verified: false },
      })
    }

    await prisma.oTP.create({
      data: { userId, otp: code, type, expiresAt: expiry },
    })

    if (type === 'email' && email) {
      await sendOTPEmail(email, code)
      return NextResponse.json({ success: true, message: 'OTP sent to email' })
    }

    if (type === 'phone' && phone) {
      try {
        await sendOTPSMS(phone, code)
        return NextResponse.json({ success: true, message: 'OTP sent to phone' })
      } catch (err) {
        console.error('Twilio error:', err.message)
        return NextResponse.json({ error: 'Failed to send SMS. Check phone number.' }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Email or phone required' }, { status: 400 })
  }

  if (action === 'verify') {
    const record = await prisma.oTP.findFirst({
      where: {
        otp,
        type,
        verified: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    await prisma.oTP.update({
      where: { id: record.id },
      data: { verified: true },
    })

    return NextResponse.json({ success: true, message: 'OTP verified' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
