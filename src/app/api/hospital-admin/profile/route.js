import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const hospital = await prisma.hospital.findUnique({
    where: { id: session.hospitalId },
    include: { bankDetails: true },
  })
  return NextResponse.json({ hospital })
}

export async function PATCH(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { type, ...data } = body

  if (type === 'profile') {
    await prisma.hospital.update({
      where: { id: session.hospitalId },
      data: {
        name: data.name, phone: data.phone, email: data.email,
        website: data.website, address: data.address, state: data.state,
        district: data.district, city: data.city, timings: data.timings,
        locationLink: data.locationLink, description: data.description,
      },
    })
  }

  if (type === 'bank') {
    await prisma.bankDetails.upsert({
      where: { hospitalId: session.hospitalId },
      update: data,
      create: { ...data, hospitalId: session.hospitalId },
    })
  }

  return NextResponse.json({ success: true })
}
