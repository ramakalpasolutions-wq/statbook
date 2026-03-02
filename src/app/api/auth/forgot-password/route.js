import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendOTPEmail } from '@/lib/mailer'
import { generateOTP, getOTPExpiry } from '@/lib/otpHelper'

export async function POST(req) {
  const { action, email, otp, newPassword } = await req.json()

  if (action === 'send') {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'Email not registered' }, { status: 404 })

    const code = generateOTP()
    await prisma.oTP.create({
      data: { userId: user.id, otp: code, type: 'forgot-password', expiresAt: getOTPExpiry() },
    })
    await sendOTPEmail(email, code)
    return NextResponse.json({ success: true })
  }

  if (action === 'reset') {
    const record = await prisma.oTP.findFirst({
      where: { otp, type: 'forgot-password', verified: true },
      include: { user: true },
    })
    if (!record) return NextResponse.json({ error: 'OTP not verified' }, { status: 400 })

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: record.userId }, data: { password: hashed } })
    return NextResponse.json({ success: true, message: 'Password reset successful' })
  }
}
