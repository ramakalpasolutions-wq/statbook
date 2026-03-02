import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    console.log('DOCTOR SESSION:', JSON.stringify(session))

    if (!session) return NextResponse.json({ error: 'No session' }, { status: 401 })
    if (session.role !== 'DOCTOR') return NextResponse.json({ error: `Wrong role: ${session.role}` }, { status: 401 })

    const doctor = await prisma.doctor.findUnique({
    where: { id: session.id },
      include: { hospital: { select: { name: true, hospitalId: true } } }
    })
    console.log('DOCTOR FOUND:', JSON.stringify(doctor))

    if (!doctor) return NextResponse.json({ error: 'Doctor record not found for userId: ' + session.id }, { status: 404 })
    return NextResponse.json({ doctor })
  } catch (err) {
    console.error('doctor/me error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
