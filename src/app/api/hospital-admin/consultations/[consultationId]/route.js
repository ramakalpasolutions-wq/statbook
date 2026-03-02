import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { consultationId } = await params

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        user:   { select: { name: true, phone: true, email: true } },
        doctor: { select: { name: true, specializations: true, doctorId: true } },
      },
    })

    if (!consultation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (consultation.hospitalId !== session.hospitalId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ consultation })
  } catch (err) {
    console.error('CONSULTATION DETAIL ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
