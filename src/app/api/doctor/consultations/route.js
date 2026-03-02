import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { sendCancellationNotification, sendRescheduleNotification } from '@/lib/notifications'

export async function GET(req) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')

    const where = { doctorId: session.id, type: 'OFFLINE' }

    if (status) where.status = status

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      }
    } else {
      const start = new Date(); start.setHours(0, 0, 0, 0)
      const end = new Date(); end.setHours(23, 59, 59, 999)
      where.date = { gte: start, lte: end }
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { consultationId: { contains: search, mode: 'insensitive' } },
      ]
    }

    const consultations = await prisma.consultation.findMany({
      where,
      include: { user: { select: { name: true, phone: true, email: true } } },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    })

    return NextResponse.json({ consultations })
  } catch (err) {
    console.error('doctor/consultations GET error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status, newDate, newTime } = await req.json()

    const data = { status }
    if (newDate) data.date = new Date(newDate)
    if (newTime) data.time = newTime
    if (status === 'CANCELLED') {
      data.cancelledBy = 'DOCTOR'
      data.cancelledByName = session.name
    }
    if (status === 'RESCHEDULED') {
      data.rescheduledBy = session.name
    }

    const consultation = await prisma.consultation.update({
      where: { id },
      data,
      include: {
        user: { select: { name: true, phone: true, email: true } },
        doctor: { select: { name: true } },
      },
    })

    // fire notifications (non-fatal)
    try {
      const dateStr = new Date(consultation.date).toLocaleDateString('en-IN')
      if (status === 'CANCELLED') {
        await sendCancellationNotification({
          userName: consultation.user.name,
          userPhone: consultation.user.phone,
          userEmail: consultation.user.email,
          doctorName: consultation.doctor.name,
          date: dateStr,
          time: consultation.time,
          cancelledBy: 'the Doctor',
        })
      }
      if (status === 'RESCHEDULED' && newDate && newTime) {
        await sendRescheduleNotification({
          userName: consultation.user.name,
          userPhone: consultation.user.phone,
          userEmail: consultation.user.email,
          doctorName: consultation.doctor.name,
          newDate: new Date(newDate).toLocaleDateString('en-IN'),
          newTime,
        })
      }
    } catch (notifErr) {
      console.error('Notification error (non-fatal):', notifErr.message)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('doctor/consultations PATCH error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
