import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hospital = await prisma.hospital.findUnique({
    where: { id: session.hospitalId },
    select: {
      id: true, name: true, hospitalId: true, email: true,
      type: true, status: true, city: true, phone: true,
    },
  })
  return NextResponse.json({ hospital })
}
