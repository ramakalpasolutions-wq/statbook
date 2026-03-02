import { FlaskConical, Clock } from 'lucide-react'

export default function ComingSoon({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <Clock size={36} className="text-blue-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-3">{title}</h2>
      <p className="text-gray-500 text-lg mb-2">Coming Soon</p>
      <p className="text-gray-400 text-sm max-w-sm">{description}</p>
      <div className="mt-8 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`w-2 h-2 rounded-full bg-blue-600 animate-bounce`}
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}
