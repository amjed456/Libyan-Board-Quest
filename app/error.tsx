'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-gray-400 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
} 