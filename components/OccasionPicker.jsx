'use client'
import { useState, useEffect } from 'react'
import { fetchOccasions, saveCustomOccasion, deleteCustomOccasion } from '@/lib/occasions'

const LOADING_PLACEHOLDER = [
  { id: '__loading1', label: 'Loading…', emoji: '⏳', isCustomTab: false },
]

function OccasionList({ list, selectedValue, onSelect, onTabSwitch }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
      {list.map((occ) => {
        const selected = selectedValue === occ.id
        const isLoading = occ.id.startsWith('__loading')
        return (
          <button
            key={occ.id}
            type="button"
            disabled={isLoading}
            onClick={() => occ.isCustomTab ? onTabSwitch('custom') : onSelect(occ.id)}
            className={[
              'flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border',
              'text-[12px] font-medium transition-all whitespace-nowrap',
              isLoading
                ? 'bg-gray-50 border-gray-100 text-gray-300 animate-pulse'
                : selected
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
            tab === t.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700',
          ].join(' ')}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export default function OccasionPicker({ value, onChange }) {
  const [tab, setTab]               = useState('international')
  const [customEmoji, setCustomEmoji] = useState('🎉')
  const [customText, setCustomText]   = useState('')
  const [saving, setSaving]           = useState(false)
  const [allOccasions, setAllOccasions] = useState(LOADING_PLACEHOLDER)

  useEffect(() => {
    fetchOccasions().then(setAllOccasions)
    if (value?.startsWith('custom:')) {
      const [, emoji = '🎉', text = ''] = value.split(':')
      setTab('custom')
      setCustomEmoji(emoji)
      setCustomText(text)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const international  = allOccasions.filter((o) => !o.khmer && !o.isLocalCustom)
  const khmer          = allOccasions.filter((o) => o.khmer)
  // Only show THIS device's custom occasions
  const localCustoms   = allOccasions.filter((o) => o.isLocalCustom)

  const handleCustomSave = () => {
    const text = customText.trim()
    if (!text || saving) return
    setSaving(true)
    try {
      // Sync — saves to localStorage only, never Supabase
      const id = saveCustomOccasion({ emoji: customEmoji, label: text })
      onChange(id)
      // Refresh list
      fetchOccasions().then(setAllOccasions)
      setCustomText('')
    } finally {
      setSaving(false)
    }
  }

  const removeCustom = (id, e) => {
    e.stopPropagation()
    // Remove from localStorage only
    deleteCustomOccasion(id)
    if (value === id) onChange('birthday')
    fetchOccasions().then(setAllOccasions)
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

          {/* This device's saved custom occasions */}
          {localCustoms.length > 0 && (
            <>
              <div className="flex gap-2 flex-wrap">
                {localCustoms.map((c) => {
                  const selected = value === c.id
                  return (
                    <div
                      key={c.id}
                      className={[
                        'flex items-center gap-1.5 pl-3 pr-1 py-1.5 rounded-full border text-[12px] font-medium transition-all',
                        selected ? 'bg-[#1D9E75] border-[#1D9E75] text-white' : 'bg-white border-gray-200 text-gray-600',
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

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[11px] text-gray-300">add new</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            </>
          )}

          {/* Create new */}
          <div className="flex gap-2">
            <div className="w-16">
              <label className="text-[11px] text-gray-400 mb-1.5 block">Emoji</label>
              <input
                value={customEmoji}
                onChange={(e) => setCustomEmoji(e.target.value)}
                className="w-full text-center text-lg h-9 border border-gray-200 rounded-lg outline-none focus:border-[#1D9E75] transition-colors"
                maxLength={2}
                style={{ fontSize: 16 }}
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] text-gray-400 mb-1.5 block">Occasion name</label>
              <input
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="e.g. Promotion, Retirement…"
                maxLength={30}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg outline-none focus:border-[#1D9E75] transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSave()}
                style={{ fontSize: 16 }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCustomSave}
            disabled={!customText.trim() || saving}
            className="w-full py-2 rounded-xl text-[13px] font-medium bg-[#1D9E75] text-white disabled:opacity-40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {saving
              ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
              : 'Save & use this occasion'
            }
          </button>

          {localCustoms.length === 0 && (
            <p className="text-[11px] text-center text-gray-300">
              Your custom occasions are saved on this device only
            </p>
          )}
        </div>
      )}
    </div>
  )
}