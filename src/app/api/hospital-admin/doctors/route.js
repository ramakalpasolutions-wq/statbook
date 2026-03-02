import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const status = searchParams.get('status')

  const where = { hospitalId: session.hospitalId }
  if (status) where.status = status
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { doctorId: { contains: search, mode: 'insensitive' } },
      { specializations: { has: search } },
    ]
  }

  const doctors = await prisma.doctor.findMany({
    where,
    include: { _count: { select: { consultations: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const [total, active, inactive, online] = await Promise.all([
    prisma.doctor.count({ where: { hospitalId: session.hospitalId } }),
    prisma.doctor.count({ where: { hospitalId: session.hospitalId, status: 'ACTIVE' } }),
    prisma.doctor.count({ where: { hospitalId: session.hospitalId, status: 'INACTIVE' } }),
    prisma.doctor.count({ where: { hospitalId: session.hospitalId, isOnlineConsultation: true } }),
  ])

  return NextResponse.json({ doctors, stats: { total, active, inactive, online } })
}

export async function POST(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()

    const existing = await prisma.doctor.findFirst({
      where: { OR: [{ email: body.email }, { phone: body.phone }] },
    })
    if (existing) return NextResponse.json({ error: 'Doctor with this email or phone exists' }, { status: 409 })

    const count = await prisma.doctor.count({ where: { hospitalId: session.hospitalId } })
    const hospital = await prisma.hospital.findUnique({
      where: { id: session.hospitalId },
      select: { hospitalId: true },
    })
    const doctorId = `DOC-${hospital.hospitalId}-${String(count + 1).padStart(3, '0')}`
    const hashed = await bcrypt.hash(body.password, 12)

    const doctor = await prisma.doctor.create({
      data: {
        doctorId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        bloodGroup: body.bloodGroup,
        qualification: body.qualification,
        experience: body.experience,
        specializations: body.specializations,
        consultationFee: body.consultationFee,
        availabilityType: body.availabilityType,
        startTime: body.startTime,
        endTime: body.endTime,
        timeSlots: body.timeSlots || null,
        isOnlineConsultation: body.isOnlineConsultation,
        onlineConsultationFee: body.onlineConsultationFee || null,
        password: hashed,
        hospitalId: session.hospitalId,
      },
    })

    return NextResponse.json({ success: true, doctor })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 })
  }
}

export async function PATCH(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status, ...rest } = await req.json()
  const data = {}
  if (status) {
    data.status = status
    if (status === 'INACTIVE') data.inactiveSince = new Date()
  }
  Object.assign(data, rest)

  await prisma.doctor.update({ where: { id }, data })
  return NextResponse.json({ success: true })
}
