import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  // Get hospitalId from token in production
  // const token = cookies().get('token')?.value
  // const decoded = verifyToken(token)

  if (type === 'stats') {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    const [totalConsultations, todayConsultations, revenueData, monthRevenueData, pendingData] = await Promise.all([
      prisma.consultation.count(),
      prisma.consultation.count({ where: { date: { gte: today, lt: tomorrow } } }),
      prisma.revenue.aggregate({ _sum: { totalRevenue: true } }),
      prisma.revenue.aggregate({ _sum: { totalRevenue: true }, where: { createdAt: { gte: monthStart } } }),
      prisma.revenue.aggregate({ _sum: { payable: true }, where: { status: 'INACTIVE' } }),
    ])

    return NextResponse.json({
      totalConsultations,
      todayConsultations,
      totalRevenue: revenueData._sum.totalRevenue ?? 0,
      monthRevenue: monthRevenueData._sum.totalRevenue ?? 0,
      pendingRevenue: pendingData._sum.payable ?? 0,
    })
  }

  if (type === 'records') {
    const doctorId = searchParams.get('doctor')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const search = searchParams.get('search')

    const where = {}
    if (doctorId) where.doctorId = doctorId
    if (from || to) {
      where.date = {}
      if (from) where.date.gte = new Date(from)
      if (to) { const t = new Date(to); t.setHours(23, 59, 59); where.date.lte = t }
    }
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search } } },
      ]
    }

    const records = await prisma.consultation.findMany({
      where,
      include: {
        doctor: { select: { name: true } },
        user: { select: { name: true, phone: true } },
      },
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(records)
  }

  return NextResponse.json([])
}
