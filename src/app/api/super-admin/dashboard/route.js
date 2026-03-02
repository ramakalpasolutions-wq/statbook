import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const [
    totalHospitals, activeHospitals, totalDoctors, totalUsers,
    monthConsultations, todayConsultations,
    accepted, cancelled, rescheduled,
    recentHospitals, recentConsultations,
  ] = await Promise.all([
    prisma.hospital.count(),
    prisma.hospital.count({ where: { status: 'ACTIVE' } }),
    prisma.doctor.count(),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.consultation.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.consultation.count({ where: { date: { gte: today, lt: tomorrow } } }),
    prisma.consultation.count({ where: { status: 'ACCEPTED' } }),
    prisma.consultation.count({ where: { status: 'CANCELLED' } }),
    prisma.consultation.count({ where: { status: 'RESCHEDULED' } }),
    prisma.hospital.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, city: true, state: true, type: true, status: true },
    }),
    prisma.consultation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        user: { select: { name: true } },
        doctor: { select: { name: true } },
      },
    }),
  ])

  return NextResponse.json({
    stats: {
      totalHospitals, activeHospitals, totalDoctors, totalUsers,
      monthConsultations, todayConsultations,
      accepted, cancelled, rescheduled,
    },
    recentHospitals,
    recentConsultations,
  })
}
