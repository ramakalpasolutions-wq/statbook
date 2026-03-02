import axios from 'axios'

export async function sendSMSOTP(phone, otp) {
  // Using MSG91 — get free API key at msg91.com
  const authKey = process.env.MSG91_AUTH_KEY
  const templateId = process.env.MSG91_TEMPLATE_ID

  if (!authKey) {
    // Dev mode — just log OTP
    console.log(`[DEV] OTP for ${phone}: ${otp}`)
    return
  }

  try {
    await axios.post('https://api.msg91.com/api/v5/otp', {
      template_id: templateId,
      mobile: `91${phone}`,
      authkey: authKey,
      otp,
    })
  } catch (err) {
    console.error('SMS send failed:', err.message)
  }
}

export async function verifySMSOTP(phone, otp) {
  const authKey = process.env.MSG91_AUTH_KEY
  if (!authKey) {
    // Dev mode — accept 123456 as test OTP
    return otp === '123456'
  }

  try {
    const res = await axios.get(
      `https://api.msg91.com/api/v5/otp/verify?authkey=${authKey}&mobile=91${phone}&otp=${otp}`
    )
    return res.data.type === 'success'
  } catch {
    return false
  }
}
