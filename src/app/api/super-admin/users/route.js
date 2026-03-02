import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const status = searchParams.get('status')

  const where = { role: 'USER' }
  if (status) where.status = status
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ]
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      _count: { select: { consultations: true, familyMembers: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const [total, active, inactive, totalConsultations] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({ where: { role: 'USER', status: 'ACTIVE' } }),
    prisma.user.count({ where: { role: 'USER', status: 'INACTIVE' } }),
    prisma.consultation.count(),
  ])

  return NextResponse.json({
    users,
    stats: { total, active, inactive, totalConsultations },
  })
}

export async function PATCH(req) {
  const { id, status } = await req.json()
  await prisma.user.update({ where: { id }, data: { status } })
  return NextResponse.json({ success: true })
}
