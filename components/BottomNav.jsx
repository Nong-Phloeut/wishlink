'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Inbox } from 'lucide-react' 
import { cn } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'

export default function BottomNav() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('common')

  const isActive = (href) => pathname === href || (href !== `/${locale}` && pathname.startsWith(href))

  const tabs = [
    { 
      href: `/${locale}`, 
      label: t('create') || 'Create', 
      icon: Sparkles 
    },
    { 
      href: `/${locale}/my-wishes`, 
      label: t('myWishes') || 'My Wishes', 
      icon: Inbox 
    },
  ]

  return (
    // Reduced outer padding from pb-8 to pb-5
    <div className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none pb-5 px-10">
      {/* Reduced max-width from 320px to 280px for a slimmer "island" look */}
      <nav className="max-w-[400px] mx-auto pointer-events-auto">
        <div className="relative flex items-center justify-around bg-white/90 backdrop-blur-xl border border-white/50 p-1 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.08)]">
          
          {tabs.map((tab) => {
            const active = isActive(tab.href)
            const Icon = tab.icon

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 py-2.5 transition-all duration-300 active:scale-95",
                  active ? "text-[#1D9E75]" : "text-stone-400"
                )}
              >
                {/* Slimmer Active Background */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-1 bg-emerald-50/80 rounded-[1.5rem] -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}

                <Icon
                  className={cn(
                    "w-4 h-4 mb-0.5 transition-all duration-300", // Shrunk icon from w-5 to w-4
                    active ? "scale-110 stroke-[2.5px]" : "stroke-[2px]"
                  )}
                />

                <span className={cn(
                  "text-[12px] font-bold uppercase tracking-wider transition-opacity", // Shrunk text from 10px to 9px
                  active ? "opacity-100" : "opacity-50"
                )}>
                  {tab.label}
                </span>

                {/* Tiny indicator line */}
                {active && (
                  <motion.div
                    layoutId="indicator"
                    className="absolute -bottom-0 w-4 h-0.5 bg-[#1D9E75] rounded-full"
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
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