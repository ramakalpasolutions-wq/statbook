import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendOTPSMS(phone, otp) {
  // India numbers need +91 prefix
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
  await client.messages.create({
    body: `Your STAT BOOK OTP is: ${otp}. Valid for 10 minutes. Do not share this with anyone.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: formattedPhone,
  })
}
