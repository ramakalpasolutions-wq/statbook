import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const specialization = searchParams.get('specialization')
    const lat = parseFloat(searchParams.get('lat'))
    const lng = parseFloat(searchParams.get('lng'))
    const city = searchParams.get('city')

    const where = { status: 'ACTIVE' }

    if (type === 'online') where.isOnline = true
    if (type === 'emergency') where.isEmergency = true

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (specialization) {
      where.doctors = {
        some: { status: 'ACTIVE', specializations: { has: specialization } },
      }
    }

    // City fallback filter
    if (city && !lat) {
      where.OR = [
        ...(where.OR || []),
        { city: { contains: city, mode: 'insensitive' } },
        { district: { contains: city, mode: 'insensitive' } },
      ]
    }

    const hospitals = await prisma.hospital.findMany({
      where,
      include: {
        doctors: {
          where: { status: 'ACTIVE' },
          select: { specializations: true },
        },
        _count: { select: { consultations: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    let enriched = hospitals.map(h => ({
      ...h,
      specializations: [...new Set(h.doctors.flatMap(d => d.specializations))],
      distanceKm: (lat && lng && h.latitude && h.longitude)
        ? parseFloat(getDistanceKm(lat, lng, h.latitude, h.longitude).toFixed(1))
        : null,
    }))

    // Sort by distance if GPS available
    if (lat && lng) {
      enriched = enriched.sort((a, b) => {
        if (a.distanceKm === null) return 1
        if (b.distanceKm === null) return -1
        return a.distanceKm - b.distanceKm
      })
    }

    return NextResponse.json({ hospitals: enriched })
  } catch (err) {
    console.error('user/hospitals error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
