import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where = { userId: session.id }
    if (status) where.status = status

    const consultations = await prisma.consultation.findMany({
      where,
      include: {
        doctor: { select: { name: true, specializations: true } },
        hospital: { select: { name: true, address: true } },
        payment: { select: { status: true, amount: true, razorpayPaymentId: true } },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ consultations })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// User cancels consultation
export async function PATCH(req) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await req.json()

    const consultation = await prisma.consultation.findUnique({ where: { id } })
    if (!consultation || consultation.userId !== session.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (!['PENDING', 'ACCEPTED'].includes(consultation.status)) {
      return NextResponse.json({ error: 'Cannot cancel this consultation' }, { status: 400 })
    }

    await prisma.consultation.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledBy: 'USER', cancelledByName: session.name },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
