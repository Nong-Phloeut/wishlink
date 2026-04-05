'use client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import OccasionPicker from '@/components/OccasionPicker'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export default function DetailsStep({
  occasion, setOccasion,
  recipient, setRecipient,
  message, setMessage,
  fromName, setFromName,
  date, setDate,
  errors, setErrors,
  onNext,
  inputClass,
  errorInputClass,
}) {
  const t  = useTranslations('create')
  const tc = useTranslations('common')

  return (
    <div className="space-y-3">
      {/* Occasion */}
      <Card className="border-stone-200 shadow-sm">
        <CardContent className="pt-4 pb-3">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
            {t('occasion')}
          </p>
          <OccasionPicker value={occasion} onChange={setOccasion} />
        </CardContent>
      </Card>

      {/* Recipient + Message */}
      <Card className="border-stone-200 shadow-sm">
        <CardContent className="pt-4 pb-4 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                {t('recipientName')} <span className="text-red-400">*</span>
              </label>
              {errors.recipient && (
                <span className="text-[10px] text-red-400 font-medium">{errors.recipient}</span>
              )}
            </div>
            <input
              type="text"
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value)
                if (errors.recipient) setErrors(p => ({ ...p, recipient: null }))
              }}
              placeholder={t('recipientPlaceholder')}
              maxLength={40}
              className={cn(inputClass, 'border-stone-200', errors.recipient && errorInputClass)}
            />
          </div>

          <Separator className="bg-stone-100" />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                {t('message')} <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                {errors.message && (
                  <span className="text-[10px] text-red-400 font-medium">{errors.message}</span>
                )}
                <span className="text-[10px] text-stone-300">{message.length}/400</span>
              </div>
            </div>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                if (errors.message) setErrors(p => ({ ...p, message: null }))
              }}
              placeholder={t('messagePlaceholder')}
              maxLength={400}
              rows={4}
              className={cn(inputClass, 'border-stone-200 resize-none leading-relaxed', errors.message && errorInputClass)}
            />
          </div>
        </CardContent>
      </Card>

      {/* From + Date */}
      <Card className="border-stone-200 shadow-sm">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">
                {t('from')}
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder={t('fromPlaceholder')}
                maxLength={30}
                className={cn(inputClass, 'border-stone-200')}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">
                {t('date')}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={cn(inputClass, 'border-stone-200')}
                style={{ colorScheme: 'light', minHeight: '46px' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="button"
        onClick={onNext}
        className="w-full h-11 rounded-xl text-[14px] font-semibold bg-[#1D9E75] hover:bg-[#178060] shadow-md shadow-[#1D9E75]/20"
      >
        {t('nextMedia')}
      </Button>
    </div>
  )
}