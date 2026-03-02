export function generateMeetLink() {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const seg = (n) => Array.from({ length: n }, () => 
    chars[Math.floor(Math.random() * chars.length)]).join('')
  const roomId = `${seg(3)}-${seg(4)}-${seg(3)}`
  return `https://meet.google.com/${roomId}`
}

// Generates links like:
// https://meet.google.com/abc-defg-hij
// https://meet.google.com/xyz-mnop-qrs
