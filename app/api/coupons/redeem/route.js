import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const body = await request.json()
    const { code, wish_id } = body

    if (!code) {
      return Response.json({ error: 'Missing code' }, { status: 400 })
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single()

    if (error || !coupon) {
      return Response.json({ error: 'Invalid coupon code' }, { status: 404 })
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return Response.json({ error: 'This coupon has expired' }, { status: 400 })
    }

    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      return Response.json({ error: 'This coupon has reached its limit' }, { status: 400 })
    }

    if (wish_id) {
      const { data: existing } = await supabase
        .from('coupon_redemptions')
        .select('id')
        .eq('wish_id', wish_id)
        .single()

      if (existing) {
        return Response.json({ error: 'A coupon has already been used for this wish' }, { status: 400 })
      }

      await supabase
        .from('coupon_redemptions')
        .insert([{ coupon_id: coupon.id, wish_id }])

      await supabase
        .from('wishes')
        .update({ is_premium: true })
        .eq('id', wish_id)
    }

    await supabase
      .from('coupons')
      .update({ used_count: coupon.used_count + 1 })
      .eq('id', coupon.id)

    return Response.json({ success: true })

  } catch (err) {
    console.error('coupon route error:', err)
    return Response.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}