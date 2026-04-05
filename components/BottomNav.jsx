'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  {
    href: '/',
    label: 'Create',
    icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#1D9E75' : 'none'} stroke={active ? '#1D9E75' : '#9CA3AF'} strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="M12 8v8M8 12h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/my-wishes',
    label: 'My Wishes',
    icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#1D9E75' : '#9CA3AF'} strokeWidth="1.8">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-[480px] mx-auto px-5 pb-6 pointer-events-auto">
        {/* Frosted glass pill nav */}
        <div className="flex gap-2 bg-white/80 backdrop-blur-xl rounded-2xl p-1.5 border border-gray-200/60 shadow-lg shadow-black/5">
          {tabs.map((tab) => {
            const active = pathname === tab.href
            const Icon = tab.icon
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-200',
                  active
                    ? 'bg-[#F0FDF8] shadow-sm'
                    : 'hover:bg-gray-50'
                )}
              >
                <Icon active={active} />
                <span
                  className={cn(
                    'text-[10px] font-semibold tracking-wide transition-colors',
                    active ? 'text-[#1D9E75]' : 'text-gray-400'
                  )}
                >
                  {tab.label}
                </span>
                {active && (
                  <span className="absolute bottom-3 w-1 h-1 rounded-full bg-[#1D9E75]" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}