import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Create Razorpay order
export async function POST(req) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { hospitalId, doctorId, date, time, type, fee, patientName, patientRelation, description } = await req.json()

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(fee * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    })

    // Store pending booking in Payment table
    const consultation = await prisma.consultation.create({
      data: {
        consultationId: `CONS-${Date.now()}`,
        userId: session.id,
        doctorId,
        hospitalId,
        date: new Date(date),
        time,
        type,
        fee: parseFloat(fee),
        status: 'PENDING',
        patientName: patientName || null,
        patientRelation: patientRelation || null,
        description: description || null,
      },
    })

    await prisma.payment.create({
      data: {
        consultationId: consultation.id,
        razorpayOrderId: order.id,
        amount: parseFloat(fee),
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      orderId: order.id,
      consultationId: consultation.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('user/book error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
