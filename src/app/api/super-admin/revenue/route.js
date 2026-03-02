import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const where = {}
  if (status) where.status = status
  if (search) where.hospital = { name: { contains: search, mode: 'insensitive' } }

  const today = new Date()
  const dayOfWeek = today.getDay()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - dayOfWeek)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const settlements = await prisma.settlement.findMany({
    where,
    include: { hospital: { select: { name: true, hospitalId: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const [totalRev, weekRev, pendingPay, settledAmt, lastSettled] = await Promise.all([
    prisma.settlement.aggregate({ _sum: { totalRevenue: true } }),
    prisma.settlement.aggregate({
      _sum: { totalRevenue: true },
      where: { weekStart: { gte: weekStart }, weekEnd: { lte: weekEnd } },
    }),
    prisma.settlement.aggregate({
      _sum: { payable: true },
      where: { status: 'UNSETTLED' },
    }),
    prisma.settlement.aggregate({
      _sum: { payable: true },
      where: { status: 'SETTLED' },
    }),
    prisma.settlement.findFirst({
      where: { status: 'SETTLED' },
      orderBy: { settledAt: 'desc' },
      select: { settledAt: true },
    }),
  ])

  return NextResponse.json({
    settlements,
    stats: {
      totalRevenue: totalRev._sum.totalRevenue ?? 0,
      weekRevenue: weekRev._sum.totalRevenue ?? 0,
      pendingPayable: pendingPay._sum.payable ?? 0,
      settledAmount: settledAmt._sum.payable ?? 0,
      lastSettledDate: lastSettled?.settledAt ?? null,
    },
  })
}

export async function PATCH(req) {
  const { id, status } = await req.json()
  await prisma.settlement.update({
    where: { id },
    data: { status, settledAt: status === 'SETTLED' ? new Date() : null },
  })
  return NextResponse.json({ success: true })
}
