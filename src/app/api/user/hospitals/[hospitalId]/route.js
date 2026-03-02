import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const { hospitalId } = await params

    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      include: {
        doctors: {
          where: { status: 'ACTIVE' },
          select: {
            id: true, doctorId: true, name: true,
            specializations: true, experience: true,
            qualification: true, consultationFee: true,
            isOnlineConsultation: true, onlineConsultationFee: true,
            availabilityType: true, startTime: true, endTime: true,
          },
        },
      },
    })

    if (!hospital) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ hospital })
  } catch (err) {
    console.error('user/hospitals/[id] error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
