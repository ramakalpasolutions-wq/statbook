import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: session.id },
      include: { hospital: { select: { name: true, hospitalId: true } } }
    })

    if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    return NextResponse.json({ doctor })
  } catch (err) {
    console.error('doctor/profile GET error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { newPassword, currentPassword, ...rest } = body

    // name is never editable
    delete rest.name

    // convert numeric strings to proper types
    if (rest.experience) rest.experience = parseInt(rest.experience)
    if (rest.consultationFee) rest.consultationFee = parseFloat(rest.consultationFee)
    if (rest.onlineConsultationFee) rest.onlineConsultationFee = parseFloat(rest.onlineConsultationFee)

    const data = { ...rest }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password required' }, { status: 400 })
      }
      const doctor = await prisma.doctor.findUnique({ where: { id: session.id } })
      if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
      const valid = await bcrypt.compare(currentPassword, doctor.password)
      if (!valid) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
      }
      data.password = await bcrypt.hash(newPassword, 10)
    }

    await prisma.doctor.update({
      where: { id: session.id },
      data,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('doctor/profile PATCH error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
