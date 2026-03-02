import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'statbook-secret-key')

export async function POST(req) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    let sessionData = null

    // ─── Check User table first (Super Admin + Hospital Admin users) ──
    const userRecord = await prisma.user.findUnique({ where: { email } })

    // ─── 1. Super Admin ───────────────────────────────────────────────
    if (userRecord?.role === 'SUPER_ADMIN') {
      const valid = await bcrypt.compare(password, userRecord.password)
      if (!valid) return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
      sessionData = {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        role: 'SUPER_ADMIN',
      }
    }

    // ─── 2. Hospital Admin (via User model → find their hospital) ─────
    if (!sessionData && userRecord?.role === 'HOSPITAL_ADMIN') {
      const valid = await bcrypt.compare(password, userRecord.password)
      if (!valid) return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
      const hospital = await prisma.hospital.findFirst({
        where: { adminId: userRecord.id },
      })
      if (!hospital) return NextResponse.json({ error: 'No hospital assigned' }, { status: 403 })
      if (hospital.status === 'INACTIVE') return NextResponse.json({ error: 'Hospital is inactive' }, { status: 403 })
      if (hospital.status === 'PENDING') return NextResponse.json({ error: 'Hospital pending approval' }, { status: 403 })
      sessionData = {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        role: 'HOSPITAL_ADMIN',
        hospitalId: hospital.id,  // ✅ critical
      }
    }

    // ─── 3. Hospital Admin (via Hospital email directly) ──────────────
    if (!sessionData) {
      const hospital = await prisma.hospital.findUnique({ where: { email } })
      if (hospital) {
        const valid = await bcrypt.compare(password, hospital.password)
        if (!valid) return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
        if (hospital.status === 'INACTIVE') return NextResponse.json({ error: 'Hospital is inactive' }, { status: 403 })
        if (hospital.status === 'PENDING') return NextResponse.json({ error: 'Hospital pending approval' }, { status: 403 })
        sessionData = {
          id: hospital.id,
          name: hospital.name,
          email: hospital.email,
          role: 'HOSPITAL_ADMIN',
          hospitalId: hospital.id,
        }
      }
    }

    // ─── 4. Doctor ────────────────────────────────────────────────────
    if (!sessionData) {
      const doctor = await prisma.doctor.findUnique({ where: { email } })
      if (doctor) {
        const valid = await bcrypt.compare(password, doctor.password)
        if (!valid) return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
        if (doctor.status === 'INACTIVE') return NextResponse.json({ error: 'Doctor account is inactive' }, { status: 403 })
        sessionData = {
          id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          role: 'DOCTOR',
          doctorId: doctor.id,
          hospitalId: doctor.hospitalId,
        }
      }
    }

    // ─── 5. Regular User ──────────────────────────────────────────────
    if (!sessionData && userRecord?.role === 'USER') {
      const valid = await bcrypt.compare(password, userRecord.password)
      if (!valid) return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
      sessionData = {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        role: 'USER',
      }
    }

    // ─── Not found ────────────────────────────────────────────────────
    if (!sessionData) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 })
    }

    // ─── Sign JWT ─────────────────────────────────────────────────────
    const token = await new SignJWT(sessionData)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(SECRET)

    const cookieStore = await cookies()
    cookieStore.set('statbook-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return NextResponse.json({ success: true, role: sessionData.role, user: sessionData })
  } catch (err) {
    console.error('LOGIN ERROR:', err)
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 })
  }
}
