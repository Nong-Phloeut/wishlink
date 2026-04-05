'use client'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function StepIndicator({ step, onStepClick, imageCount, hasVideo }) {
  const t = useTranslations('create')

  return (
    <div className="flex items-center gap-2 mb-1">
      {[t('step1'), t('step2')].map((label, i) => {
        const s = i + 1
        const active = step === s
        const done = step > s
        return (
          <button
            key={s}
            type="button"
            onClick={() => onStepClick(s)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border',
              active ? 'bg-[#1D9E75] text-white border-[#1D9E75]' :
              done   ? 'bg-[#F0FDF8] text-[#1D9E75] border-[#A7F3D0]' :
                       'bg-white text-stone-400 border-stone-200'
            )}
          >
            <span className={cn(
              'w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold',
              active ? 'bg-white/20 text-white' :
              done   ? 'bg-[#1D9E75] text-white' :
                       'bg-stone-100 text-stone-400'
            )}>
              {done ? '✓' : s}
            </span>
            {label}
          </button>
        )
      })}
      {(imageCount > 0 || hasVideo) && (
        <Badge className="ml-auto text-[9px] bg-[#F0FDF8] text-[#1D9E75] border border-[#A7F3D0] font-medium">
          {imageCount > 0 && `${imageCount}📷`}
          {hasVideo && ' 🎥'}
        </Badge>
      )}
    </div>
  )
}