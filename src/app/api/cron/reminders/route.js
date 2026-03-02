import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReminderNotification } from '@/lib/notifications'

export async function GET(req) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)

  // Find consultations happening in ~1 hour that haven't been reminded
  const upcoming = await prisma.consultation.findMany({
    where: {
      status: { in: ['PENDING', 'ACCEPTED'] },
      date: { gte: oneHourLater, lte: twoHoursLater },
    },
    include: {
      user: { select: { name: true, phone: true, email: true } },
      doctor: { select: { name: true } },
    },
  })

  let sent = 0
  for (const c of upcoming) {
    try {
      await sendReminderNotification({
        userName: c.user.name,
        userPhone: c.user.phone,
        userEmail: c.user.email,
        doctorName: c.doctor.name,
        time: c.time,
      })
      sent++
    } catch (err) {
      console.error('Reminder failed for:', c.id, err.message)
    }
  }

  return NextResponse.json({ success: true, remindersSent: sent })
}
