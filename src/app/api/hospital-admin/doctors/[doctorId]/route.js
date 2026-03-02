import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { doctorId } = await params

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        leaves: { orderBy: { startDate: 'asc' } },
        _count: { select: { consultations: true } },
      },
    })

    if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })

    if (doctor.hospitalId !== session.hospitalId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const today = new Date(); today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)

    const [totalConsultations, todayConsultations, completed, cancelled, pending] = await Promise.all([
      prisma.consultation.count({ where: { doctorId } }),
      prisma.consultation.count({ where: { doctorId, date: { gte: today, lt: tomorrow } } }),
      prisma.consultation.count({ where: { doctorId, status: 'COMPLETED' } }),
      prisma.consultation.count({ where: { doctorId, status: 'CANCELLED' } }),
      prisma.consultation.count({ where: { doctorId, status: 'PENDING' } }),
    ])

    const recentConsultations = await prisma.consultation.findMany({
      where: { doctorId },
      include: { user: { select: { name: true, phone: true } } },
      orderBy: { date: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      doctor,
      stats: { totalConsultations, todayConsultations, completed, cancelled, pending },
      recentConsultations,
    })
  } catch (err) {
    console.error('DOCTOR GET ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { doctorId } = await params
    const body = await req.json()

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 12)
    }

    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: body,
    })

    return NextResponse.json({ success: true, doctor })
  } catch (err) {
    console.error('DOCTOR PATCH ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { doctorId } = await params

    await prisma.doctor.delete({ where: { id: doctorId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DOCTOR DELETE ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
