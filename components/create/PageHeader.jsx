'use client'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { Badge } from '@/components/ui/badge'

export default function PageHeader() {
  const tc = useTranslations('common')

  return (
    <div className="pt-8 pb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#1D9E75] flex items-center justify-center text-base shadow-sm shadow-[#1D9E75]/30">
            🎁
          </div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900">
            <span className="text-[#1D9E75]">ជូនពរ</span>
          </h1>
        </div>
        <LanguageSwitcher />
      </div>
      <div className="flex items-center gap-2">
        <p className="text-[12px] text-stone-400">{tc('tagline')}</p>
        <div className="flex-1 h-px bg-stone-200" />
        <Badge className="text-[9px] bg-[#F0FDF8] text-[#1D9E75] border border-[#A7F3D0] font-medium">
          Free
        </Badge>
      </div>
    </div>
  )
}