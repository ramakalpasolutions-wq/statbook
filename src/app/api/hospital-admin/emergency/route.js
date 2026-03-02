import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const where = { hospitalId: session.hospitalId }
  if (status) where.status = status
  const emergencies = await prisma.emergency.findMany({
    where, orderBy: { requestTime: 'desc' },
  })
  return NextResponse.json({ emergencies })
}

export async function PATCH(req) {
  const { id, status, attendedAt } = await req.json()
  await prisma.emergency.update({
    where: { id },
    data: { status, attendedAt: attendedAt ? new Date(attendedAt) : undefined },
  })
  return NextResponse.json({ success: true })
}
