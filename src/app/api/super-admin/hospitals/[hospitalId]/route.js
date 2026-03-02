import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const { hospitalId } = await params

    const today = new Date(); today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)

    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      include: { bankDetails: true },
    })

    if (!hospital) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [
      totalConsultations, todayConsultations,
      accepted, cancelled, rescheduled, completed,
      totalDoctors, activeDoctors,
      revenueData,
    ] = await Promise.all([
      prisma.consultation.count({ where: { hospitalId } }),
      prisma.consultation.count({ where: { hospitalId, date: { gte: today, lt: tomorrow } } }),
      prisma.consultation.count({ where: { hospitalId, status: 'ACCEPTED' } }),
      prisma.consultation.count({ where: { hospitalId, status: 'CANCELLED' } }),
      prisma.consultation.count({ where: { hospitalId, status: 'RESCHEDULED' } }),
      prisma.consultation.count({ where: { hospitalId, status: 'COMPLETED' } }),
      prisma.doctor.count({ where: { hospitalId } }),
      prisma.doctor.count({ where: { hospitalId, status: 'ACTIVE' } }),
      prisma.revenue.aggregate({
        where: { hospitalId },
        _sum: { totalRevenue: true },
      }),
    ])

    const doctors = await prisma.doctor.findMany({
      where: { hospitalId },
      select: {
        id: true, name: true, doctorId: true,
        specializations: true, status: true,
        experience: true,                        // ✅ include experience
        consultationFee: true,
        _count: { select: { consultations: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      hospital,
      doctors,
      stats: {
        totalConsultations,
        todayConsultations,   // ✅ renamed from 'today'
        accepted,
        cancelled,
        rescheduled,
        completed,
        totalDoctors,
        activeDoctors,
        totalRevenue: revenueData._sum.totalRevenue ?? 0,
      },
    })
  } catch (err) {
    console.error('HOSPITAL DETAIL ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  try {
    const { hospitalId } = await params
    const body = await req.json()
    const { bankDetails, ...hospitalData } = body

    const hospital = await prisma.hospital.update({
      where: { id: hospitalId },
      data: hospitalData,
    })

    if (bankDetails) {
      await prisma.bankDetails.upsert({
        where: { hospitalId },
        update: bankDetails,
        create: { ...bankDetails, hospitalId },
      })
    }

    return NextResponse.json({ success: true, hospital })
  } catch (err) {
    console.error('HOSPITAL UPDATE ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
