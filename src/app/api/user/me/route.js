import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'USER') {
      return NextResponse.json({ user: null }, { status: 200 })
    }
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true, name: true, email: true,
        phone: true, address: true, profilePhoto: true,
        familyMembers: true,
      },
    })
    return NextResponse.json({ user })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
