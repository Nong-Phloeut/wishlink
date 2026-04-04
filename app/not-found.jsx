import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center bg-[#f8f7f4]">
      <div className="text-5xl mb-4">🔍</div>
      <h1 className="font-display text-[24px] font-semibold text-gray-800 mb-2">
        Wish not found
      </h1>
      <p className="text-[14px] text-gray-400 mb-6 max-w-xs leading-relaxed">
        This wish link may have expired or been deleted. Ask the sender for a new one.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-[#1D9E75] text-white rounded-xl text-[14px] font-medium hover:bg-[#085041] transition-colors"
      >
        Create a new wish
      </Link>
    </div>
  )
}
