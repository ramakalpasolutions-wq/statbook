import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!from || !to) {
      return NextResponse.json({ error: 'from and to params required' }, { status: 400 })
    }

    const [consultations, leaves] = await Promise.all([
      prisma.consultation.findMany({
        where: {
          doctorId: session.id,
          date: { gte: new Date(from), lte: new Date(to) },
          status: { in: ['PENDING', 'ACCEPTED', 'COMPLETED'] },
        },
        include: { user: { select: { name: true } } },
        orderBy: { date: 'asc' },
      }),
      prisma.doctorLeave.findMany({
        where: {
          doctorId: session.id,
          endDate: { gte: new Date(from) },
        },
        orderBy: { startDate: 'asc' },
      }),
    ])

    return NextResponse.json({ consultations, leaves })
  } catch (err) {
    console.error('doctor/calendar GET error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { startDate, endDate, reason } = await req.json()
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'startDate and endDate required' }, { status: 400 })
    }

    const leave = await prisma.doctorLeave.create({
      data: {
        doctorId: session.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason || null,
      },
    })

    return NextResponse.json({ success: true, leave })
  } catch (err) {
    console.error('doctor/calendar POST error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Leave ID required' }, { status: 400 })

    // make sure doctor can only delete their own leaves
    const leave = await prisma.doctorLeave.findUnique({ where: { id } })
    if (!leave || leave.doctorId !== session.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
    }

    await prisma.doctorLeave.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('doctor/calendar DELETE error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
