import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const search = searchParams.get('search')

  // Single user detail
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true },
    })
    const consultations = await prisma.consultation.findMany({
      where: { userId },
      include: {
        doctor: { select: { name: true } },
        hospital: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    })
    return NextResponse.json({ user, consultations })
  }

  // All users list
  const where = { role: 'USER' }
  if (search) where.name = { contains: search, mode: 'insensitive' }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true, name: true, email: true,
      _count: { select: { consultationsAsUser: true } },
      consultationsAsUser: {
        orderBy: { date: 'desc' },
        take: 1,
        select: { date: true, time: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(users)
}

export async function PATCH(req) {
  const { id, status, cancelledBy, rescheduledBy, newDate, newTime } = await req.json()

  const data = { status }
  if (cancelledBy) data.cancelledBy = cancelledBy
  if (rescheduledBy) data.rescheduledBy = rescheduledBy
  if (newDate) data.date = new Date(newDate)
  if (newTime) data.time = newTime

  await prisma.consultation.update({ where: { id }, data })
  return NextResponse.json({ success: true })
}
