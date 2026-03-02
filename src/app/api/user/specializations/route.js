import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { status: 'ACTIVE' },
      select: { specializations: true },
    })
    const unique = [...new Set(doctors.flatMap(d => d.specializations))].sort()
    return NextResponse.json({ specializations: unique })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
