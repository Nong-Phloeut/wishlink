import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getOccasion } from '@/lib/occasions'
import RevealClient from './RevealClient'

export async function generateMetadata({ params }) {
  const { id } = await params
  const { data: wish } = await supabase.from('wishes').select('*').eq('id', id).single()
  if (!wish) return { title: 'Wish not found' }
  const occ = getOccasion(wish.occasion)
  return {
    title: `A Surprise for ${wish.recipient} ✨`,
    description: "Tap to reveal your special message.",
  }
}

export default async function Page({ params }) {
  const { id } = await params
  const { data: wish, error } = await supabase.from('wishes').select('*').eq('id', id).single()

  if (error || !wish) notFound()

  // Background update
  supabase.from('wishes').update({ scans: (wish.scans || 0) + 1 }).eq('id', id).then()

  return <RevealClient wish={wish} />
}