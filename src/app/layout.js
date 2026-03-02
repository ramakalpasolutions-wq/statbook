import { Geist } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const geist = Geist({ subsets: ['latin'] })

export const metadata = {
  title: 'STAT BOOK',
  description: 'Hospital Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  )
}
