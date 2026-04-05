import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function usePremium(wishId) {
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!wishId) { setLoading(false); return }

    // Check localStorage first (instant)
    const premiumWishes = JSON.parse(localStorage.getItem('premium_wishes') || '[]')
    if (premiumWishes.includes(wishId)) {
      setIsPremium(true)
      setLoading(false)
      return
    }

    // Verify with Supabase
    supabase
      .from('wishes')
      .select('is_premium')
      .eq('id', wishId)
      .single()
      .then(({ data }) => {
        if (data?.is_premium) {
          setIsPremium(true)
          // Cache in localStorage
          const stored = JSON.parse(localStorage.getItem('premium_wishes') || '[]')
          if (!stored.includes(wishId)) {
            stored.push(wishId)
            localStorage.setItem('premium_wishes', JSON.stringify(stored))
          }
        }
        setLoading(false)
      })
  }, [wishId])

  const markPremium = () => {
    setIsPremium(true)
    const stored = JSON.parse(localStorage.getItem('premium_wishes') || '[]')
    if (!stored.includes(wishId)) {
      stored.push(wishId)
      localStorage.setItem('premium_wishes', JSON.stringify(stored))
    }
  }

  return { isPremium, loading, markPremium }
}