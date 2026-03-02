import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const hospitalId = searchParams.get('hospitalId')

    const where = {}
    if (status) where.status = status
    if (hospitalId) where.hospitalId = hospitalId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { doctorId: { contains: search, mode: 'insensitive' } },
        { specializations: { has: search } },
      ]
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        hospital: { select: { name: true, hospitalId: true } },
        _count: { select: { consultations: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const [total, active, inactive, online] = await Promise.all([
      prisma.doctor.count(),
      prisma.doctor.count({ where: { status: 'ACTIVE' } }),
      prisma.doctor.count({ where: { status: 'INACTIVE' } }),
      prisma.doctor.count({ where: { isOnlineConsultation: true } }),
    ])

    return NextResponse.json({
      doctors,
      stats: { total, active, inactive, online },
    })
  } catch (err) {
    console.error('DOCTORS ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const { id, status } = await req.json()
    await prisma.doctor.update({ where: { id }, data: { status } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
