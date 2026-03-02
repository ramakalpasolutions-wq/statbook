import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const { doctorId } = await params  // ✅ await params

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        hospital: { select: { name: true, hospitalId: true, city: true } },
      },
    })

    if (!doctor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const consultations = await prisma.consultation.findMany({
      where: { doctorId },
      include: {
        user: { select: { name: true, phone: true } },
        hospital: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
      take: 20,
    })

    const [total, completed, cancelled, rescheduled] = await Promise.all([
      prisma.consultation.count({ where: { doctorId } }),
      prisma.consultation.count({ where: { doctorId, status: 'COMPLETED' } }),
      prisma.consultation.count({ where: { doctorId, status: 'CANCELLED' } }),
      prisma.consultation.count({ where: { doctorId, status: 'RESCHEDULED' } }),
    ])

    return NextResponse.json({
      doctor,
      consultations,
      stats: { total, completed, cancelled, rescheduled },
    })
  } catch (err) {
    console.error('DOCTOR DETAIL ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
