import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  const session = await getSession()
  if (!session || session.role !== 'DOCTOR') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const doctor = await prisma.doctor.findUnique({ where: { id: session.id } })

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  const where = { doctorId: doctor.id, type: 'ONLINE' }
  if (startDate && endDate) {
    where.date = { gte: new Date(startDate), lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) }
  } else {
    const start = new Date(); start.setHours(0, 0, 0, 0)
    const end = new Date(); end.setHours(23, 59, 59, 999)
    where.date = { gte: start, lte: end }
  }

  const consultations = await prisma.consultation.findMany({
    where,
    include: { user: { select: { name: true, phone: true, email: true } } },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  })

  return NextResponse.json({ consultations })
}

export async function PATCH(req) {
  const session = await getSession()
  if (!session || session.role !== 'DOCTOR') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status, newDate, newTime } = await req.json()
  const data = { status }
  if (newDate) data.date = new Date(newDate)
  if (newTime) data.time = newTime
  await prisma.consultation.update({ where: { id }, data })
  return NextResponse.json({ success: true })
}
