'use client'
import { useState } from 'react'
import { occasions } from '@/lib/occasions'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function OccasionPicker({ value, onChange }) {
  const [customText, setCustomText] = useState('')
  const [customEmoji, setCustomEmoji] = useState('🎉')

  const international = occasions.filter((o) => !o.khmer)
  const khmer = occasions.filter((o) => o.khmer)

  const isCustom = value?.startsWith('custom:')

  const handleCustomSave = () => {
    if (!customText.trim()) return
    onChange(`custom:${customEmoji}:${customText.trim()}`)
  }

  const OccasionList = ({ list }) => (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
      {list.map((occ) => {
        const selected = value === occ.id
        return (
          <button
            key={occ.id}
            type="button"
            onClick={() => onChange(occ.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border text-[12px] font-medium transition-all whitespace-nowrap ${
              selected
                ? 'bg-[#1D9E75] border-[#1D9E75] text-white shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:border-[#1D9E75] hover:text-[#1D9E75]'
            }`}
          >
            <span>{occ.emoji}</span>
            <span>{occ.label}</span>
          </button>
        )
      })}
    </div>
  )

  return (
    <Tabs defaultValue="international">
      <TabsList className="w-full mb-3 h-9">
        <TabsTrigger value="international" className="flex-1 text-[11px]">🌍 International</TabsTrigger>
        <TabsTrigger value="khmer" className="flex-1 text-[11px]">🇰🇭 Khmer</TabsTrigger>
        <TabsTrigger value="custom" className="flex-1 text-[11px]">✏️ Custom</TabsTrigger>
      </TabsList>

      <TabsContent value="international" className="mt-0">
        <OccasionList list={international} />
      </TabsContent>

      <TabsContent value="khmer" className="mt-0">
        <OccasionList list={khmer} />
      </TabsContent>

      <TabsContent value="custom" className="mt-0">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="w-16">
              <Label className="text-[11px] text-gray-400 mb-1.5 block">Emoji</Label>
              <Input
                value={customEmoji}
                onChange={(e) => setCustomEmoji(e.target.value)}
                className="text-center text-lg h-9"
                maxLength={2}
              />
            </div>
            <div className="flex-1">
              <Label className="text-[11px] text-gray-400 mb-1.5 block">Occasion name</Label>
              <Input
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="e.g. Promotion, Retirement…"
                maxLength={30}
                className="h-9 text-[13px]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCustomSave}
            disabled={!customText.trim()}
            className="w-full py-2 rounded-xl text-[13px] font-medium bg-[#1D9E75] text-white disabled:opacity-40 transition-all active:scale-[0.98]"
          >
            {isCustom ? '✓ Saved' : 'Use this occasion'}
          </button>

          {isCustom && (
            <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#F0FDF8] rounded-lg border border-[#A7F3D0]">
              <span>{value.split(':')[1]}</span>
              <span className="text-[12px] text-[#059669] font-medium">{value.split(':')[2]}</span>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}