import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'statbook-secret-key')

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('statbook-token')?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, SECRET)
    return payload   // ✅ contains { id, name, email, role, hospitalId }
  } catch {
    return null
  }
}
