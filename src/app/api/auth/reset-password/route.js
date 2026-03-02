import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  const token = cookies().get('token')?.value
  const decoded = verifyToken(token)
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { oldPassword, newPassword } = await req.json()
  const user = await prisma.user.findUnique({ where: { id: decoded.id } })

  const isValid = await bcrypt.compare(oldPassword, user.password)
  if (!isValid) return NextResponse.json({ error: 'Old password incorrect' }, { status: 400 })

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: decoded.id }, data: { password: hashed } })

  return NextResponse.json({ success: true })
}
