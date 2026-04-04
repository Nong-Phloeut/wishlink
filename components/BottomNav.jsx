'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/',
    label: 'Create',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="14" height="14" rx="3" />
        <path d="M10 7v6M7 10h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/my-wishes',
    label: 'My Wishes',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 5h14M3 10h9M3 15h6" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-[480px] mx-auto px-4 pb-4">
        <div className="flex gap-1 bg-white rounded-2xl p-1 border border-[#e5e5e3] shadow-sm">
          {tabs.map((tab) => {
            const active = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all"
                style={{
                  background: active ? '#E1F5EE' : 'transparent',
                  color: active ? '#085041' : '#888780',
                }}
              >
                {tab.icon}
                <span className="text-[11px] font-medium">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
