import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  // Protect with a secret header
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

  // Find hospitals inactive >= 2 years
  const inactiveHospitals = await prisma.hospital.findMany({
    where: { status: 'INACTIVE', inactiveSince: { lte: twoYearsAgo } },
  })

  for (const hospital of inactiveHospitals) {
    // Delete consultations and revenue
    const consultations = await prisma.consultation.findMany({
      where: { hospitalId: hospital.id },
    })

    for (const c of consultations) {
      await prisma.revenue.deleteMany({ where: { consultationId: c.id } })
    }
    await prisma.consultation.deleteMany({ where: { hospitalId: hospital.id } })
    await prisma.doctor.deleteMany({ where: { hospitalId: hospital.id } })

    await prisma.auditLog.create({
      data: {
        action: 'AUTO_DELETE',
        entityType: 'Hospital',
        entityId: hospital.id,
        details: { name: hospital.name, reason: 'Inactive >= 2 years' },
      },
    })

    await prisma.hospital.delete({ where: { id: hospital.id } })
  }

  return NextResponse.json({ success: true, deleted: inactiveHospitals.length })
}
