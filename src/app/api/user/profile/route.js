import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true, name: true, email: true, phone: true,
        address: true, profilePhoto: true, familyMembers: true,
        consultations: {
          include: {
            doctor: { select: { name: true, specializations: true } },
            hospital: { select: { name: true } },
            payment: { select: { status: true, amount: true } },
          },
          orderBy: { date: 'desc' },
          take: 20,
        },
      },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ user })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { currentPassword, newPassword, familyMembers, ...rest } = body

    const data = { ...rest }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ error: 'Current password required' }, { status: 400 })
      const user = await prisma.user.findUnique({ where: { id: session.id } })
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
      data.password = await bcrypt.hash(newPassword, 10)
    }

    // Handle family members
    if (familyMembers !== undefined) {
      data.familyMembers = familyMembers
    }

    await prisma.user.update({ where: { id: session.id }, data })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
