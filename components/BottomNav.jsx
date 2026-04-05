'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { PlusSquare, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { useLocale } from 'next-intl'


export default function BottomNav() {
  const pathname = usePathname()
  const locale = useLocale()

  const tabs = [
    { href: `/${locale}`, label: 'Create', icon: PlusSquare },
    { href: `/${locale}/my-wishes`, label: 'My Wishes', icon: ClipboardList },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-6 px-6">
      <nav className="max-w-[400px] mx-auto pointer-events-auto">
        <div className="relative flex items-center justify-around bg-white/70 backdrop-blur-md border border-slate-200/50 p-1.5 rounded-3xl shadow-xl shadow-black/5">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            const Icon = tab.icon

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 py-2 rounded-2xl transition-colors",
                  isActive ? "text-emerald-600" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-emerald-50 rounded-[1.25rem] -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <Icon
                  className={cn(
                    "w-5 h-5 mb-1 transition-transform",
                    isActive ? "scale-110 stroke-[2.5px]" : "stroke-[2px]"
                  )}
                />

                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {tab.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="dot"
                    className="absolute -bottom-1 w-1 h-1 bg-emerald-500 rounded-full"
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}