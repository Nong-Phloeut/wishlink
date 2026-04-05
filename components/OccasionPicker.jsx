'use client'
import { useState, useEffect } from 'react'
import { occasions } from '@/lib/occasions'

const STORAGE_KEY = 'wishlink_custom_occasions'

function OccasionList({ list, selectedValue, onSelect, onTabSwitch }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1"
      style={{ scrollbarWidth: 'none' }}
    >
      {list.map((occ) => {
        const selected = selectedValue === occ.id
        return (
          <button
            key={occ.id}
            type="button"
            onClick={() => occ.isCustomTab ? onTabSwitch('custom') : onSelect(occ.id)}
            className={[
              'flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border',
              'text-[12px] font-medium transition-all whitespace-nowrap',
              selected
                ? 'bg-[#1D9E75] border-[#1D9E75] text-white shadow-sm'
                : occ.isCustomTab
                  ? 'bg-white border-dashed border-gray-300 text-gray-500 hover:border-[#1D9E75] hover:text-[#1D9E75]'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-[#1D9E75] hover:text-[#1D9E75]',
            ].join(' ')}
          >
            <span>{occ.emoji}</span>
            <span>{occ.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function TabBar({ tab, setTab }) {
  const tabs = [
    { id: 'international', label: '🌍 International' },
    { id: 'khmer',         label: '🇰🇭 Khmer' },
    { id: 'custom',        label: '✏️ Custom' },
  ]
  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-3">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTab(t.id)}
          className={[
            'flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all',
            tab === t.id
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          ].join(' ')}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export default function OccasionPicker({ value, onChange }) {
  const [tab, setTab]                   = useState('international')
  const [customEmoji, setCustomEmoji]   = useState('🎉')
  const [customText, setCustomText]     = useState('')
  const [savedCustoms, setSavedCustoms] = useState([])

  const international = occasions.filter((o) => !o.khmer)
  const khmer         = occasions.filter((o) => o.khmer)
  const isCustom      = value?.startsWith('custom:')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setSavedCustoms(JSON.parse(stored))
    } catch {}

    if (value?.startsWith('custom:')) {
      const [, emoji = '🎉', text = ''] = value.split(':')
      setTab('custom')
      setCustomEmoji(emoji)
      setCustomText(text)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCustomSave = () => {
    const text = customText.trim()
    if (!text) return

    const id = `custom:${customEmoji}:${text}`
    onChange(id)

    setSavedCustoms((prev) => {
      const already = prev.find((c) => c.id === id)
      if (already) return prev
      const next = [{ id, emoji: customEmoji, label: text }, ...prev]
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const removeCustom = (id, e) => {
    e.stopPropagation()
    setSavedCustoms((prev) => {
      const next = prev.filter((c) => c.id !== id)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
    if (value === id) onChange('birthday')
  }

  return (
    <div>
      <TabBar tab={tab} setTab={setTab} />

      {tab === 'international' && (
        <OccasionList
          list={international}
          selectedValue={value}
          onSelect={onChange}
          onTabSwitch={setTab}
        />
      )}

      {tab === 'khmer' && (
        <OccasionList
          list={khmer}
          selectedValue={value}
          onSelect={onChange}
          onTabSwitch={setTab}
        />
      )}

      {tab === 'custom' && (
        <div className="space-y-3">

          {savedCustoms.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {savedCustoms.map((c) => {
                const selected = value === c.id
                return (
                  <div
                    key={c.id}
                    className={[
                      'flex items-center gap-1.5 pl-3 pr-1 py-1.5 rounded-full border text-[12px] font-medium transition-all',
                      selected
                        ? 'bg-[#1D9E75] border-[#1D9E75] text-white'
                        : 'bg-white border-gray-200 text-gray-600',
                    ].join(' ')}
                  >
                    <button
                      type="button"
                      onClick={() => { onChange(c.id); setCustomEmoji(c.emoji); setCustomText(c.label) }}
                      className="flex items-center gap-1.5"
                    >
                      <span>{c.emoji}</span>
                      <span>{c.label}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => removeCustom(c.id, e)}
                      className={[
                        'ml-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition-colors',
                        selected
                          ? 'bg-white/30 hover:bg-white/50 text-white'
                          : 'bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500',
                      ].join(' ')}
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {savedCustoms.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[11px] text-gray-300">add new</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
          )}

          <div className="flex gap-2">
            <div className="w-16">
              <label className="text-[11px] text-gray-400 mb-1.5 block">Emoji</label>
              <input
                value={customEmoji}
                onChange={(e) => setCustomEmoji(e.target.value)}
                className="w-full text-center text-lg h-9 border border-gray-200 rounded-lg outline-none focus:border-[#1D9E75] transition-colors"
                maxLength={2}
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] text-gray-400 mb-1.5 block">Occasion name</label>
              <input
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="e.g. Promotion, Retirement…"
                maxLength={30}
                className="w-full h-9 px-3 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#1D9E75] transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSave()}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCustomSave}
            disabled={!customText.trim()}
            className="w-full py-2 rounded-xl text-[13px] font-medium bg-[#1D9E75] text-white disabled:opacity-40 transition-all active:scale-[0.98]"
          >
            Save &amp; use this occasion
          </button>

        </div>
      )}
    </div>
  )
}