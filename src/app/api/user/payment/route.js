import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { generateMeetLink } from '@/lib/meet'
import { sendBookingConfirmation, sendOnlineConsultationEmail } from '@/lib/email'

// ── POST — Verify payment & confirm consultation ──────────────
export async function POST(req) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      consultationId,
    } = await req.json()

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !consultationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── Verify Razorpay signature ─────────────────────────────
    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      await prisma.payment.updateMany({
        where: { razorpayOrderId },
        data: { status: 'FAILED', retryCount: { increment: 1 } },
      })
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // ── Update payment to SUCCESS ─────────────────────────────
    await prisma.payment.updateMany({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status: 'SUCCESS',
      },
    })

    // ── Check consultation type ───────────────────────────────
    const existing = await prisma.consultation.findUnique({
      where: { id: consultationId },
      select: { type: true, consultationId: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 })
    }

    const isOnline = existing.type === 'ONLINE'
    const meetLink = isOnline ? generateMeetLink() : null

    // ── Confirm consultation + save meet link ─────────────────
    const consultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: 'ACCEPTED',
        ...(meetLink && { meetLink }),
      },
      include: {
        user:     { select: { name: true, email: true, phone: true } },
        doctor:   { select: { name: true } },
        hospital: { select: { name: true } },
      },
    })

    // ── Send confirmation email ───────────────────────────────
    try {
      const emailData = {
        userName:       consultation.user.name,
        userEmail:      consultation.user.email,
        doctorName:     consultation.doctor.name,
        hospitalName:   consultation.hospital.name,
        date:           new Date(consultation.date).toLocaleDateString('en-IN', { dateStyle: 'long' }),
        time:           consultation.time,
        consultationId: consultation.consultationId,
        type:           consultation.type,
      }

      if (isOnline && meetLink) {
        await sendOnlineConsultationEmail({ ...emailData, meetLink })
      } else {
        await sendBookingConfirmation(emailData)
      }
    } catch (emailErr) {
      // Don't fail the request if email fails
      console.error('Email send error:', emailErr.message)
    }

    return NextResponse.json({
      success:        true,
      consultationId: consultation.consultationId,
      type:           consultation.type,
      meetLink:       consultation.meetLink || null,
    })

  } catch (err) {
    console.error('user/payment POST error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── PATCH — Handle retry when Razorpay modal dismissed ────────
export async function PATCH(req) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { razorpayOrderId } = await req.json()

    if (!razorpayOrderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    // Find the payment record
    const payment = await prisma.payment.findFirst({
      where: { razorpayOrderId },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    const MAX_RETRIES = 3

    // Max retries reached — cancel the consultation
    if (payment.retryCount >= MAX_RETRIES) {
      // Cancel the linked consultation
      await prisma.consultation.update({
        where: { id: payment.consultationId },
        data: {
          status:      'CANCELLED',
          cancelledBy: 'PATIENT',
        },
      })

      // Mark payment as failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      })

      return NextResponse.json(
        { error: 'Maximum retries reached. Consultation has been cancelled. Please rebook.' },
        { status: 400 }
      )
    }

    // Increment retry count
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { retryCount: { increment: 1 } },
    })

    return NextResponse.json({
      success:     true,
      retriesLeft: MAX_RETRIES - updated.retryCount,
      retryCount:  updated.retryCount,
    })

  } catch (err) {
    console.error('user/payment PATCH error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
