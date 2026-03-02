import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const token = cookies().get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const decoded = verifyToken(token)
  if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { name: true, email: true, phone: true, role: true, profilePhoto: true },
  })
  return NextResponse.json(user)
}

export async function PATCH(req) {
  const token = cookies().get('token')?.value
  const decoded = verifyToken(token)
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, phone } = await req.json()
  const user = await prisma.user.update({
    where: { id: decoded.id },
    data: { name, phone },
  })
  return NextResponse.json({ success: true, user })
}
