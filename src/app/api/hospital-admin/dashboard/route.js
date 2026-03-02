import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const hospitalId = session.hospitalId

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)

  const [total, todayCnt, pending, accepted, completed, cancelled,
    rescheduled, activeEmergencies, todayConsultations, emergencies] = await Promise.all([
    prisma.consultation.count({ where: { hospitalId } }),
    prisma.consultation.count({ where: { hospitalId, date: { gte: today, lt: tomorrow } } }),
    prisma.consultation.count({ where: { hospitalId, status: 'PENDING' } }),
    prisma.consultation.count({ where: { hospitalId, status: 'ACCEPTED' } }),
    prisma.consultation.count({ where: { hospitalId, status: 'COMPLETED' } }),
    prisma.consultation.count({ where: { hospitalId, status: 'CANCELLED' } }),
    prisma.consultation.count({ where: { hospitalId, status: 'RESCHEDULED' } }),
    prisma.emergency.count({ where: { hospitalId, status: 'PENDING' } }),
    prisma.consultation.findMany({
      where: { hospitalId, date: { gte: today, lt: tomorrow } },
      include: {
        user: { select: { name: true } },
        doctor: { select: { name: true } },
      },
      orderBy: { time: 'asc' },
    }),
    prisma.emergency.findMany({
      where: { hospitalId, status: 'PENDING' },
      orderBy: { requestTime: 'desc' },
      take: 5,
    }),
  ])

  return NextResponse.json({
    stats: { total, today: todayCnt, pending, accepted, completed, cancelled, rescheduled, activeEmergencies },
    todayConsultations,
    emergencies,
  })
}
