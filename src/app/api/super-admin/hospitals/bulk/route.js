import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  const { hospitals } = await req.json()
  const results = []
  let count = await prisma.hospital.count()

  for (const h of hospitals) {
    try {
      const existing = await prisma.hospital.findFirst({
        where: { OR: [{ email: h.email }, { phone: h.phone }] },
      })
      if (existing) {
        results.push({ name: h.name, success: false, error: 'Email or phone already exists' })
        continue
      }
      count++
      const hospitalId = `HOSP-${String(count).padStart(3, '0')}`
      const hashed = await bcrypt.hash(h.password || 'Password@123', 12)
      const hospital = await prisma.hospital.create({
        data: {
          hospitalId, name: h.name, email: h.email, phone: h.phone,
          address: h.address, state: h.state, district: h.district, city: h.city,
          timings: h.timings, type: h.type || 'NORMAL',
          website: h.website, locationLink: h.locationLink,
          password: hashed, description: h.description || '',
          facilities: h.facilities || [],
          isEmergency: h.isEmergency || false,
          isOnline: h.isOnline || false,
          status: 'ACTIVE',
        },
      })
      results.push({ name: h.name, success: true, hospitalId: hospital.hospitalId })
    } catch (err) {
      results.push({ name: h.name, success: false, error: err.message })
    }
  }

  return NextResponse.json({ results })
}
