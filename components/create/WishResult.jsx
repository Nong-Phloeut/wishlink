'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import RevealCard from '@/components/RevealCard'
import SaveWishPrompt from '@/components/SaveWishPrompt'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import toast from 'react-hot-toast'

export default function WishResult({ wish, qrSrc, onReset }) {
  const tr = useTranslations('result')
  const [showPreview, setShowPreview] = useState(false)

  const copyLink = () => {
    const url = `${window.location.origin}/v/${wish.id}`
    navigator.clipboard.writeText(url)
      .then(() => toast.success('Link copied!'))
      .catch(() => toast.error('Copy failed'))
  }

  const shareLink = async () => {
    const url = `${window.location.origin}/v/${wish.id}`
    if (navigator.share) await navigator.share({ title: `A wish for ${wish.recipient}`, url })
    else copyLink()
  }

  return (
    <div className="space-y-3">

      {/* Success banner */}
      <div className="flex items-center gap-3 bg-[#F0FDF8] border border-[#A7F3D0] rounded-xl px-4 py-3">
        <span className="text-xl">🎉</span>
        <div>
          <p className="text-[13px] font-semibold text-[#065F46]">{tr('wishCreated')}</p>
          <p className="text-[11px] text-[#059669]">{tr('shareWith', { recipient: wish.recipient })}</p>
        </div>
      </div>

      {/* Save / track prompt */}
      <SaveWishPrompt wish={wish} />

      {/* QR card */}
      <Card className="border-stone-200 shadow-sm">
        <CardContent className="pt-5 pb-5 text-center">
          <div className="relative w-44 h-44 mx-auto mb-4">
            <div className="w-full h-full rounded-2xl overflow-hidden border border-stone-100 shadow-md">
              {qrSrc && <img src={qrSrc} alt="QR Code" className="w-full h-full object-cover" />}
            </div>
            {/* Corner brackets */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#1D9E75] rounded-tl" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#1D9E75] rounded-tr" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#1D9E75] rounded-bl" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#1D9E75] rounded-br" />
          </div>
          <p className="font-semibold text-[15px] text-stone-800 mb-1">
            {tr('recipientWish', { recipient: wish.recipient, occasion: wish.occasion })}
          </p>
          <p className="text-[11px] text-stone-400 mb-4">{tr('scanToReveal')}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyLink}
              className="flex-1 rounded-xl border-stone-200 text-stone-600 text-[13px]">
              {tr('copyLink')}
            </Button>
            <Button onClick={shareLink}
              className="flex-1 rounded-xl bg-[#1D9E75] hover:bg-[#178060] text-[13px]">
              {tr('share')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview toggle */}
      <Button
        variant="outline"
        onClick={() => setShowPreview(p => !p)}
        className="w-full rounded-xl border-stone-200 text-stone-500 text-[13px]"
      >
        {showPreview ? tr('hidePreview') : tr('previewCard')}
      </Button>

      {showPreview && <RevealCard wish={wish} compact />}

      <button
        onClick={onReset}
        className="w-full py-2 text-[12px] text-stone-400 hover:text-stone-600 transition-colors"
      >
        {tr('createAnother')}
      </button>
    </div>
  )
}