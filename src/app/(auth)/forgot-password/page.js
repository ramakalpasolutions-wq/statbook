'use client'
import dynamic from 'next/dynamic'
const ForgotPage = dynamic(() => import('./ForgotClient'), { ssr: false })
export default ForgotPage
