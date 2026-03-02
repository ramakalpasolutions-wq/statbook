'use client'
import dynamic from 'next/dynamic'
const RegisterPage = dynamic(() => import('./RegisterClient'), { ssr: false })
export default RegisterPage
