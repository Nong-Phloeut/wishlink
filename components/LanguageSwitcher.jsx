'use client'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'km', label: 'ខ្មែរ', flag: '🇰🇭' },
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale) => {
    // Strip current locale prefix from pathname
    const segments = pathname.split('/')
    if (segments[1] === 'en' || segments[1] === 'km') {
      segments[1] = newLocale
    } else {
      segments.splice(1, 0, newLocale)
    }
    router.push(segments.join('/') || '/')
  }

  const current = languages.find((l) => l.code === locale) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl border-stone-200 text-stone-600 h-9 px-3 text-[12px]"
        >
          <span>{current.flag}</span>
          <span className="hidden sm:inline">{current.label}</span>
          <Globe size={13} className="text-stone-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl min-w-[140px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => switchLocale(lang.code)}
            className={`gap-2 rounded-lg text-[13px] cursor-pointer ${
              locale === lang.code ? 'bg-[#F0FDF8] text-[#1D9E75] font-medium' : ''
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
            {locale === lang.code && <span className="ml-auto text-[10px]">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}