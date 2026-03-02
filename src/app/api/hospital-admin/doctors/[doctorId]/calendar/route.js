import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { doctorId } = await params

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true, name: true, doctorId: true,
        specializations: true, availabilityType: true,
        startTime: true, endTime: true, timeSlots: true,
        hospitalId: true,
      },
    })

    if (!doctor || doctor.hospitalId !== session.hospitalId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const leaves = await prisma.doctorLeave.findMany({
      where: { doctorId },
      orderBy: { startDate: 'asc' },
    })

    const consultations = await prisma.consultation.findMany({
      where: {
        doctorId,
        date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
      },
      select: {
        id: true, date: true, time: true, status: true, type: true,
        user: { select: { name: true } },
      },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ doctor, leaves, consultations })
  } catch (err) {
    console.error('CALENDAR GET ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { doctorId } = await params
    const { startDate, endDate, reason } = await req.json()

    const leave = await prisma.doctorLeave.create({
      data: {
        doctorId,
        startDate: new Date(startDate),
        endDate:   new Date(endDate),
        reason,
      },
    })

    return NextResponse.json({ success: true, leave })
  } catch (err) {
    console.error('CALENDAR POST ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { doctorId } = await params
    const { searchParams } = new URL(req.url)
    const leaveId = searchParams.get('leaveId')

    await prisma.doctorLeave.delete({ where: { id: leaveId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('CALENDAR DELETE ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
