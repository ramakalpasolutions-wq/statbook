export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function getOTPExpiry() {
  return new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
}
