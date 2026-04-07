import { supabase } from '@/lib/supabase'

// ─── System occasions from Supabase ───────────────────────────────────────────
export async function fetchOccasions() {
  const { data, error } = await supabase
    .from('occasions')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Failed to fetch occasions', error)
    return getStaticOccasions()
  }

  const system = data.map((o) => ({
    id: o.id,
    label: o.label,
    emoji: o.emoji,
    bg: o.bg,
    fg: o.fg,
    border: o.border,
    accent: o.accent,
    khmer: o.is_khmer,
    isSystem: o.is_system,
    isCustomTab: o.is_custom_tab,
  }))

  // Merge system occasions with this device's local custom occasions
  const localCustoms = getLocalCustomOccasions()
  return [...system, ...localCustoms]
}

// ─── Local custom occasions — per device, never shared ────────────────────────
export function getLocalCustomOccasions() {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('custom_occasions') || '[]')
  } catch {
    return []
  }
}

export function saveCustomOccasion({ emoji, label }) {
  const id = `local_${Date.now()}`
  const newOccasion = {
    id,
    label,
    emoji,
    bg: '#F1EFE8',
    fg: '#2C2C2A',
    border: '#B4B2A9',
    accent: '#5F5E5A',
    khmer: false,
    isSystem: false,
    isCustomTab: false,
    isLocalCustom: true,
  }
  const existing = getLocalCustomOccasions()
  existing.push(newOccasion)
  localStorage.setItem('custom_occasions', JSON.stringify(existing))
  return id
}

export function deleteCustomOccasion(id) {
  const existing = getLocalCustomOccasions()
  const updated = existing.filter((o) => o.id !== id)
  localStorage.setItem('custom_occasions', JSON.stringify(updated))
}

// ─── Static fallback if Supabase is unreachable ───────────────────────────────
function getStaticOccasions() {
  return [
    { id: 'birthday',        label: 'Birthday',       emoji: '🎂', bg: '#E1F5EE', fg: '#085041', border: '#5DCAA5', accent: '#1D9E75', khmer: false, isSystem: true },
    { id: 'anniversary',     label: 'Anniversary',    emoji: '💍', bg: '#EEEDFE', fg: '#26215C', border: '#AFA9EC', accent: '#7F77DD', khmer: false, isSystem: true },
    { id: 'wedding',         label: 'Wedding',        emoji: '💒', bg: '#FBEAF0', fg: '#4B1528', border: '#ED93B1', accent: '#D4537E', khmer: false, isSystem: true },
    { id: 'newyear',         label: 'New Year',       emoji: '🎆', bg: '#FAEEDA', fg: '#412402', border: '#EF9F27', accent: '#BA7517', khmer: false, isSystem: true },
    { id: 'farewell',        label: 'Farewell',       emoji: '✈️', bg: '#E6F1FB', fg: '#042C53', border: '#85B7EB', accent: '#378ADD', khmer: false, isSystem: true },
    { id: 'khmernew year',   label: 'Khmer New Year', emoji: '🌺', bg: '#FFF7ED', fg: '#1C0A00', border: '#FCD34D', accent: '#B45309', khmer: true,  isSystem: true },
    { id: 'khmergraduation', label: 'Graduation',     emoji: '🎓', bg: '#FFFBEB', fg: '#1C0A00', border: '#FDE68A', accent: '#D97706', khmer: true,  isSystem: true },
    { id: 'custom',          label: 'Custom',         emoji: '🎉', bg: '#F1EFE8', fg: '#2C2C2A', border: '#B4B2A9', accent: '#5F5E5A', khmer: false, isSystem: true, isCustomTab: true },
    ...getLocalCustomOccasions(),
  ]
}

// ─── getOccasion — used by RevealCard, reveal page (server + client) ──────────
export function getOccasion(id) {
  if (!id) return getStaticOccasions()[0]

  // Legacy custom: format support
  if (id.startsWith('custom:')) {
    const [, emoji = '🎉', label = 'Custom'] = id.split(':')
    return { id, label, emoji, bg: '#F1EFE8', border: '#B4B2A9', accent: '#5F5E5A', fg: '#2C2C2A' }
  }

  // Local custom
  const local = getLocalCustomOccasions().find((o) => o.id === id)
  if (local) return local

  // Static list
  return getStaticOccasions().find((o) => o.id === id) || getStaticOccasions()[0]
}