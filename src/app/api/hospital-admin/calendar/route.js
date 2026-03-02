import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const where = {}
  if (from && to) {
    where.date = {
      gte: new Date(from),
      lte: new Date(to),
    }
  }

  const consultations = await prisma.consultation.findMany({
    where,
    select: {
      id: true,
      date: true,
      time: true,
      status: true,
      consultationId: true,
      fee: true,
      user: { select: { name: true } },
      doctor: { select: { name: true } },
    },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(consultations)
}
