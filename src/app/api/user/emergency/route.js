import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// Haversine formula — distance in km between two coordinates
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

export async function POST(req) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { latitude, longitude, address, description, hospitalId, patientName } = await req.json()

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true, phone: true, location: true },
    })

    let targetHospitals = []
    let method = null

    // ── If specific hospital selected ──────────────────────────
    if (hospitalId) {
      const h = await prisma.hospital.findUnique({ where: { id: hospitalId } })
      if (h) targetHospitals = [h]
      method = 'selected'
    }

    // ── Option C: GPS first ────────────────────────────────────
    if (!targetHospitals.length && latitude && longitude) {
      const allEmergency = await prisma.hospital.findMany({
        where: { status: 'ACTIVE', isEmergency: true },
      })

      // Filter hospitals within 50km radius, sort by nearest
      const nearby = allEmergency
        .filter(h => h.latitude && h.longitude)
        .map(h => ({
          ...h,
          distanceKm: getDistanceKm(latitude, longitude, h.latitude, h.longitude),
        }))
        .filter(h => h.distanceKm <= 50)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 3)

      if (nearby.length > 0) {
        targetHospitals = nearby
        method = 'gps'
      }
    }

    // ── Fallback: city name match ──────────────────────────────
    if (!targetHospitals.length) {
      // Extract city from user.location or address field
      const userCity = user?.location || null

      if (userCity) {
        targetHospitals = await prisma.hospital.findMany({
          where: {
            status: 'ACTIVE',
            isEmergency: true,
            OR: [
              { city: { contains: userCity, mode: 'insensitive' } },
              { district: { contains: userCity, mode: 'insensitive' } },
            ],
          },
          take: 3,
        })
        method = 'city'
      }
    }

    // ── No hospitals found anywhere ────────────────────────────
    if (!targetHospitals.length) {
      return NextResponse.json({
        feasible: false,
        error: 'No emergency hospitals available in your area. Please call 108 immediately.',
        callNational: true,
      }, { status: 200 })
    }

    // ── Create emergency alerts ────────────────────────────────
    const alerts = await Promise.all(
      targetHospitals.map(h =>
        prisma.emergency.create({
          data: {
            userId: session.id,
            hospitalId: h.id,
            patientName: patientName || user?.name || session.name,
            phone: user?.phone || '',
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            locationText: address || user?.location || null,
            note: description || null,
            status: 'PENDING',
          },
        })
      )
    )

    return NextResponse.json({
      feasible: true,
      success: true,
      method, // 'gps' | 'city' | 'selected'
      alertCount: alerts.length,
      hospitals: targetHospitals.map(h => ({
        name: h.name,
        phone: h.phone,
        address: h.address,
        city: h.city,
        distanceKm: h.distanceKm ? `${h.distanceKm.toFixed(1)} km away` : null,
      })),
    })
  } catch (err) {
    console.error('user/emergency POST error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const emergencies = await prisma.emergency.findMany({
      where: { userId: session.id },
      include: { hospital: { select: { name: true, phone: true, address: true } } },
      orderBy: { requestTime: 'desc' },
      take: 10,
    })

    return NextResponse.json({ emergencies })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
