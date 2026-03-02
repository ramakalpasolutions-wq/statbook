import Link from 'next/link'
export default function ComingSoonEscortPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-7xl mb-6">🚧</div>
      <h1 className="text-3xl font-bold text-gray-800 mb-3">Coming Soon</h1>
      <p className="text-gray-400 text-lg max-w-md mb-8">
        Healthcare Escort service is coming soon. Stay tuned!
      </p>
      <Link href="/user/dashboard"
        className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
        Back to Home
      </Link>
    </div>
  )
}
