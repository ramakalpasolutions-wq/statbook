import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const status = searchParams.get('status')
  const type   = searchParams.get('type')
  const date   = searchParams.get('date')

  const where = { hospitalId: session.hospitalId }
  if (status) where.status = status
  if (type)   where.type = type
  if (date) {
    const start = new Date(date); start.setHours(0, 0, 0, 0)
    const end   = new Date(date); end.setHours(23, 59, 59, 999)
    where.date  = { gte: start, lte: end }
  }
  if (search) {
    where.OR = [
      { consultationId: { contains: search, mode: 'insensitive' } },
      { user:   { name: { contains: search, mode: 'insensitive' } } },
      { doctor: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const consultations = await prisma.consultation.findMany({
    where,
    include: {
      user:   { select: { name: true, phone: true, email: true } },
      doctor: { select: { name: true, specializations: true, doctorId: true } },
    },
    orderBy: [{ date: 'desc' }, { time: 'asc' }],
  })

  const [total, pending, accepted, completed, cancelled] = await Promise.all([
    prisma.consultation.count({ where: { hospitalId: session.hospitalId } }),
    prisma.consultation.count({ where: { hospitalId: session.hospitalId, status: 'PENDING' } }),
    prisma.consultation.count({ where: { hospitalId: session.hospitalId, status: 'ACCEPTED' } }),
    prisma.consultation.count({ where: { hospitalId: session.hospitalId, status: 'COMPLETED' } }),
    prisma.consultation.count({ where: { hospitalId: session.hospitalId, status: 'CANCELLED' } }),
  ])

  return NextResponse.json({
    consultations,
    stats: { total, pending, accepted, completed, cancelled },
  })
}

export async function PATCH(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, status } = await req.json()
    const data = { status }

    if (status === 'COMPLETED') {
  // ❌ Remove: data.completedAt = new Date()  — not in schema
  const consultation = await prisma.consultation.findUnique({ where: { id } })
  const existing = await prisma.revenue.findUnique({ where: { consultationId: id } })

  if (!existing && consultation) {
    const totalRevenue = consultation.fee
    const commission   = Math.round(totalRevenue * 0.2)
    const payable      = totalRevenue - commission

    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    await prisma.revenue.create({
      data: {
        consultationId: id,
        doctorId:   consultation.doctorId,
        hospitalId: consultation.hospitalId,
        totalRevenue, commission, payable,
        status: 'ACTIVE', weekStart, weekEnd,
      },
    })
  }
}

if (status === 'CANCELLED') {
  // ❌ Remove: data.cancelledAt = new Date()  — not in schema
  data.cancelledBy     = 'ADMIN'
  data.cancelledByName = 'Hospital Admin'
}


    await prisma.consultation.update({ where: { id }, data })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('CONSULTATION PATCH ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
