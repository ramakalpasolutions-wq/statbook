import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const hospitalId = session.hospitalId

  const today = new Date()
  const dayOfWeek = today.getDay()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - dayOfWeek)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const [revenue, settlements, total, thisWeek, pendingPayable, settled] = await Promise.all([
    prisma.revenue.findMany({
      where: { hospitalId },
      include: {
        consultation: { select: { consultationId: true } },
        doctor: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.settlement.findMany({
      where: { hospitalId },
      orderBy: { weekStart: 'desc' },
    }),
    prisma.revenue.aggregate({ _sum: { totalRevenue: true }, where: { hospitalId } }),
    prisma.revenue.aggregate({
      _sum: { totalRevenue: true },
      where: { hospitalId, weekStart: { gte: weekStart }, weekEnd: { lte: weekEnd } },
    }),
    prisma.settlement.aggregate({
      _sum: { payable: true },
      where: { hospitalId, status: 'UNSETTLED' },
    }),
    prisma.settlement.aggregate({
      _sum: { payable: true },
      where: { hospitalId, status: 'SETTLED' },
    }),
  ])

  return NextResponse.json({
    revenue,
    settlements,
    stats: {
      total: total._sum.totalRevenue ?? 0,
      thisWeek: thisWeek._sum.totalRevenue ?? 0,
      pendingPayable: pendingPayable._sum.payable ?? 0,
      settled: settled._sum.payable ?? 0,
    },
  })
}
