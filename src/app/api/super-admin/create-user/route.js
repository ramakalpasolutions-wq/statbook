import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const { name, email, phone, password, role } = await req.json()

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    })
    if (existing) return NextResponse.json({ error: 'User already exists' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: { name, email, phone, password: hashed, role, emailVerified: true, phoneVerified: true },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
