import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'DOCTOR') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctor = await prisma.doctor.findUnique({ where: { id: session.id } })

  if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay); endOfDay.setHours(23, 59, 59, 999)

  const [thisMonth, today, total, upcoming] = await Promise.all([
    prisma.consultation.count({ where: { doctorId: doctor.id, date: { gte: startOfMonth } } }),
    prisma.consultation.count({ where: { doctorId: doctor.id, date: { gte: startOfDay, lte: endOfDay } } }),
    prisma.consultation.count({ where: { doctorId: doctor.id } }),
    prisma.consultation.findMany({
      where: { doctorId: doctor.id, date: { gte: startOfDay }, status: { in: ['PENDING', 'ACCEPTED'] } },
      include: { user: { select: { name: true, phone: true } } },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      take: 10,
    }),
  ])

  return NextResponse.json({ stats: { total, thisMonth, today }, upcoming })
}
