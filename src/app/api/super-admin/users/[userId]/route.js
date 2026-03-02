import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const { userId } = await params  // ✅ await params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        familyMembers: true,
        consultations: {
          include: {
            doctor: { select: { name: true, specializations: true } },
            hospital: { select: { name: true } },
          },
          orderBy: { date: 'desc' },
          take: 20,
        },
      },
    })

    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [total, completed, cancelled] = await Promise.all([
      prisma.consultation.count({ where: { userId } }),
      prisma.consultation.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.consultation.count({ where: { userId, status: 'CANCELLED' } }),
    ])

    return NextResponse.json({
      user,
      stats: { total, completed, cancelled },
    })
  } catch (err) {
    console.error('USER DETAIL ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
