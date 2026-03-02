import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const state = searchParams.get('state')
  const district = searchParams.get('district')
  const city = searchParams.get('city')
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const sortField = searchParams.get('sortField') || 'createdAt'
  const sortDir = searchParams.get('sortDir') || 'desc'

  const where = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { hospitalId: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ]
  }
  if (state) where.state = { contains: state, mode: 'insensitive' }
  if (district) where.district = { contains: district, mode: 'insensitive' }
  if (city) where.city = { contains: city, mode: 'insensitive' }
  if (type) where.type = type
  if (status) where.status = status

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)

  const hospitals = await prisma.hospital.findMany({
    where,
    orderBy: { [sortField]: sortDir },
    include: {
      _count: { select: { consultations: true, doctors: true } },
    },
  })

  // Enrich with per-hospital stats
  const enriched = await Promise.all(
    hospitals.map(async (h) => {
      const [todayCount, acceptedCount, declinedCount, rescheduledCount] = await Promise.all([
        prisma.consultation.count({ where: { hospitalId: h.id, date: { gte: today, lt: tomorrow } } }),
        prisma.consultation.count({ where: { hospitalId: h.id, status: 'ACCEPTED' } }),
        prisma.consultation.count({ where: { hospitalId: h.id, status: 'CANCELLED' } }),
        prisma.consultation.count({ where: { hospitalId: h.id, status: 'RESCHEDULED' } }),
      ])
      return { ...h, todayCount, acceptedCount, declinedCount, rescheduledCount }
    })
  )

  // Stats
  const [total, active, pending, inactive] = await Promise.all([
    prisma.hospital.count(),
    prisma.hospital.count({ where: { status: 'ACTIVE' } }),
    prisma.hospital.count({ where: { status: 'PENDING' } }),
    prisma.hospital.count({ where: { status: 'INACTIVE' } }),
  ])

  return NextResponse.json({ hospitals: enriched, stats: { total, active, pending, inactive } })
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, locationLink, address, state, district, city, timings,
      phone, type, email, website, password, facilities, isEmergency, isOnline, description } = body

    const existing = await prisma.hospital.findFirst({
      where: { OR: [{ email }, { phone }] },
    })
    if (existing) return NextResponse.json({ error: 'Hospital with this email or phone already exists' }, { status: 409 })

    // Generate hospitalId
    const count = await prisma.hospital.count()
    const hospitalId = `HOSP-${String(count + 1).padStart(3, '0')}`
    const hashed = await bcrypt.hash(password, 12)

    const hospital = await prisma.hospital.create({
      data: {
        hospitalId, name, locationLink, address, state, district, city,
        timings, phone, type, email, website, password: hashed,
        facilities: facilities || [],
        isEmergency: isEmergency || false,
        isOnline: isOnline || false,
        description: description || '',
        status: 'ACTIVE',
      },
    })

    return NextResponse.json({ success: true, hospital })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req) {
  const { id, status, ...rest } = await req.json()
  const data = {}
  if (status) {
    data.status = status
    if (status === 'INACTIVE') data.inactiveSince = new Date()
  }
  Object.assign(data, rest)
  await prisma.hospital.update({ where: { id }, data })
  return NextResponse.json({ success: true })
}
